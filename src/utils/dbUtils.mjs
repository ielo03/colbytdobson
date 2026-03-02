import mysql from "mysql2/promise";
import env from "../../environment.mjs";

export const newConnection = () => {
    return mysql.createConnection({
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        database: env.db.database,
    });
}

export const verifyMainTopicOwnership = async (mainTopicId, userId) => {
    let connection;

    try {
        connection = await newConnection();

        const query = `
            SELECT *
            FROM mainTopics
            WHERE id = ? AND userId = ?
            LIMIT 1
        `;

        const [rows] = await connection.execute(query, [mainTopicId, userId]);

        if (rows.length === 0) {
            console.error("Ownership verification failed for main topic");
            return null;
        }

        return rows[0];
    } catch (error) {
        console.error("Error verifying main topic ownership:", error.message || error);
        throw new Error("Internal database error during main topic ownership verification");
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

export const verifyBulletPointOwnership = async (bulletPointId, mainTopicId, userId) => {
    let connection;

    try {
        connection = await newConnection();

        const query = `
            SELECT bp.*
            FROM bulletPoints bp
                     INNER JOIN mainTopics mt ON bp.mainTopicId = mt.id
            WHERE bp.id = ? AND mt.id = ? AND mt.userId = ?
            LIMIT 1
        `;

        const [rows] = await connection.execute(query, [bulletPointId, mainTopicId, userId]);

        if (rows.length === 0) {
            console.error("Ownership verification failed for bullet point");
            return null;
        }

        return rows[0];
    } catch (error) {
        console.error("Error verifying bullet point ownership:", error.message || error);
        throw new Error("Internal database error during bullet point ownership verification");
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

export async function fetchExistingData(userId) {
    let connection;
    try {
        connection = await newConnection();

        const query = `
            SELECT mt.id AS mainTopicId, mt.name AS mainTopic, bp.id AS bulletPointId, bp.bulletPoint
            FROM mainTopics mt
                     LEFT JOIN bulletPoints bp ON mt.id = bp.mainTopicId
            WHERE mt.userId = ?
            ORDER BY mt.id, bp.id
        `;
        // Fetch main topics and their bullet points for the given userId
        const [rows] = await connection.execute(query, [userId]);

        // Generate the structured object
        return rows.reduce((acc, row) => {
            const { mainTopic, mainTopicId, bulletPoint, bulletPointId } = row;

            if (!acc[mainTopic]) {
                acc[mainTopic] = {
                    mainTopicId,
                    bulletPoints: [],
                };
            }

            if (bulletPoint) {
                acc[mainTopic].bulletPoints.push({
                    id: bulletPointId,
                    bulletPoint,
                });
            }

            return acc;
        }, {});
    } catch (error) {
        console.error("Error fetching resume data:", error.message || error);
        throw new Error("Failed to fetch resume data");
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

export const getTeams = async (userId) => {
    let connection;
    try {
        connection = await newConnection();

        // Insert the user into the `users` table
        const query = `
                SELECT teamId, teamName, lastAccessed
                FROM teamAdmins
                WHERE userId = ? ORDER BY lastAccessed DESC
              `;
        const [result] = await connection.execute(query, [
            userId,
        ]);
        return result;
    } catch (err) {
        console.error("Database error:", err);
        throw Object.assign(new Error("Internal database error"), { code: 500 });
    } finally {
        if (connection) await connection.end();
    }
};

const ensureServeReceiveTables = async (connection) => {
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
            sessionId INT AUTO_INCREMENT PRIMARY KEY,
            teamId INT NOT NULL,
            sessionName VARCHAR(100) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_team_session (teamId, sessionName),
            CONSTRAINT fk_sessions_team
                FOREIGN KEY (teamId) REFERENCES teams(id)
                ON DELETE CASCADE
        )
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS serveReceiveReps (
            repId INT AUTO_INCREMENT PRIMARY KEY,
            teamId INT NOT NULL,
            sessionId INT NOT NULL,
            serverPlayerId INT NULL,
            serverName VARCHAR(255) NULL,
            passerPlayerId INT NULL,
            passerName VARCHAR(255) NULL,
            passRating TINYINT NULL,
            serveRating TINYINT NOT NULL,
            missedServe TINYINT(1) NOT NULL DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_sr_team_session (teamId, sessionId),
            INDEX idx_sr_server (serverPlayerId),
            INDEX idx_sr_passer (passerPlayerId),
            CONSTRAINT fk_sr_team
                FOREIGN KEY (teamId) REFERENCES teams(id)
                ON DELETE CASCADE,
            CONSTRAINT fk_sr_session
                FOREIGN KEY (sessionId) REFERENCES sessions(sessionId)
                ON DELETE CASCADE
        )
    `);
};

const ensureAuthorizedTeam = async (connection, userId, teamId) => {
    const [rows] = await connection.execute(
        `
            SELECT 1
            FROM teamAdmins
            WHERE userId = ? AND teamId = ?
            LIMIT 1
        `,
        [userId, teamId]
    );

    if (rows.length === 0) {
        throw Object.assign(new Error("Team not found"), { code: 404 });
    }
};

export const getPlayers = async (userId, teamId) => {
    let connection;
    try {
        connection = await newConnection();
        await ensureServeReceiveTables(connection);
        await ensureAuthorizedTeam(connection, userId, teamId);

        const query = `
                SELECT p.playerId,
                       p.playerName,
                       COALESCE(passStats.averagePassRating, 0) AS averagePassRating,
                       COALESCE(passStats.totalPasses, 0) AS totalPasses,
                       COALESCE(serveStats.averageServeRating, 0) AS averageServeRating,
                       COALESCE(serveStats.totalServes, 0) AS totalServes
                FROM players p
                LEFT JOIN (
                    SELECT passerPlayerId AS playerId,
                           ROUND(AVG(passRating), 2) AS averagePassRating,
                           COUNT(*) AS totalPasses
                    FROM serveReceiveReps
                    WHERE teamId = ?
                      AND passerPlayerId IS NOT NULL
                      AND passRating IS NOT NULL
                    GROUP BY passerPlayerId
                ) passStats ON passStats.playerId = p.playerId
                LEFT JOIN (
                    SELECT serverPlayerId AS playerId,
                           ROUND(AVG(serveRating), 2) AS averageServeRating,
                           COUNT(*) AS totalServes
                    FROM serveReceiveReps
                    WHERE teamId = ?
                      AND serverPlayerId IS NOT NULL
                    GROUP BY serverPlayerId
                ) serveStats ON serveStats.playerId = p.playerId
                WHERE p.teamId = ?
                ORDER BY p.playerName
              `;
        const [result] = await connection.execute(query, [
            teamId,
            teamId,
            teamId,
        ]);
        return result;
    } catch (err) {
        console.error("Database error:", err);
        if (err.code) {
            throw err;
        }
        throw Object.assign(new Error("Internal database error"), { code: 500 });
    } finally {
        if (connection) await connection.end();
    }
};

export const isAdminOf = async (userId, teamId) => {
    let connection;
    try {
        connection = await newConnection();

        const query = `
                SELECT 1 
                FROM teamAdmins 
                WHERE userId = ? AND teamId = ?
              `;
        const [result] = await connection.execute(query, [userId, teamId]);

        console.log(`Admin check result for userId=${userId} and teamId=${teamId}:`, result);

        // If result has at least one row, the user is an admin
        return result.length > 0;
    } catch (err) {
        console.error("Database error:", err);
        throw new Error("Internal database error");
    } finally {
        if (connection) await connection.end();
    }
};

export const touchTeam = async (teamId) => {
    let connection;
    try {
        connection = await newConnection();
        const query = `UPDATE teamAdmins SET teamId = teamId WHERE teamId = ?`; // Triggers ON UPDATE without actual changes
        await connection.query(query, [teamId]);
    } catch (err) {
        console.error("Database error:", err);
        throw new Error("Internal database error");
    } finally {
        if (connection) await connection.end();
    }
};

export const getTeamId = async (userId, teamName) => {
    let connection;
    try {
        connection = await newConnection();
        const query = `SELECT teamId FROM teamAdmins WHERE userId = ? AND teamName = ?`; // Triggers ON UPDATE without actual changes
        const [result] = await connection.query(query, [userId, teamName]);
        if (result.length === 1) {
            return result[0].teamId;
        }
        return -1
    } catch (err) {
        console.error("Database error:", err);
        throw new Error("Internal database error");
    } finally {
        if (connection) await connection.end();
    }
};

export const getSessionId = async (teamId, sessionName) => {
    let connection;
    try {
        connection = await newConnection();
        await ensureServeReceiveTables(connection);
        const query = `
            SELECT sessionId
            FROM sessions
            WHERE teamId = ? AND sessionName = ?
            LIMIT 1
        `;
        const [result] = await connection.query(query, [teamId, sessionName]);
        if (result.length === 1) {
            return result[0].sessionId;
        }
        return -1;
    } catch (err) {
        console.error("Database error:", err);
        throw new Error("Internal database error");
    } finally {
        if (connection) await connection.end();
    }
};

export const createPlayer = async (userId, teamId, playerName) => {
    let connection;
    try {
        connection = await newConnection();
        await ensureServeReceiveTables(connection);
        await ensureAuthorizedTeam(connection, userId, teamId);

        const [existing] = await connection.execute(
            `
                SELECT playerId
                FROM players
                WHERE teamId = ? AND LOWER(playerName) = LOWER(?)
                LIMIT 1
            `,
            [teamId, playerName]
        );

        if (existing.length > 0) {
            throw Object.assign(new Error("Player already exists"), { code: 409 });
        }

        const [result] = await connection.execute(
            `INSERT INTO players (teamId, playerName) VALUES (?, ?)`,
            [teamId, playerName]
        );

        return result.insertId;
    } catch (err) {
        console.error("Database error:", err);
        if (err.code) {
            throw err;
        }
        throw Object.assign(new Error("Internal database error"), { code: 500 });
    } finally {
        if (connection) await connection.end();
    }
};

export const removePlayer = async (userId, teamId, playerId) => {
    let connection;
    try {
        connection = await newConnection();
        await ensureServeReceiveTables(connection);
        await ensureAuthorizedTeam(connection, userId, teamId);

        await connection.execute(
            `
                DELETE FROM players
                WHERE teamId = ? AND playerId = ?
            `,
            [teamId, playerId]
        );
    } catch (err) {
        console.error("Database error:", err);
        if (err.code) {
            throw err;
        }
        throw Object.assign(new Error("Internal database error"), { code: 500 });
    } finally {
        if (connection) await connection.end();
    }
};

export const getSessions = async (userId, teamId) => {
    let connection;
    try {
        connection = await newConnection();
        await ensureServeReceiveTables(connection);
        await ensureAuthorizedTeam(connection, userId, teamId);

        const [rows] = await connection.execute(
            `
                SELECT s.sessionId,
                       s.sessionName,
                       s.createdAt,
                       COUNT(r.repId) AS totalReps
                FROM sessions s
                LEFT JOIN serveReceiveReps r
                    ON r.sessionId = s.sessionId
                WHERE s.teamId = ?
                GROUP BY s.sessionId, s.sessionName, s.createdAt
                ORDER BY s.createdAt DESC, s.sessionId DESC
            `,
            [teamId]
        );

        return rows;
    } catch (err) {
        console.error("Database error:", err);
        if (err.code) {
            throw err;
        }
        throw Object.assign(new Error("Internal database error"), { code: 500 });
    } finally {
        if (connection) await connection.end();
    }
};

export const createSession = async (userId, teamId, sessionName) => {
    let connection;
    try {
        connection = await newConnection();
        await ensureServeReceiveTables(connection);
        await ensureAuthorizedTeam(connection, userId, teamId);

        const [result] = await connection.execute(
            `
                INSERT INTO sessions (teamId, sessionName)
                VALUES (?, ?)
            `,
            [teamId, sessionName]
        );

        return result.insertId;
    } catch (err) {
        console.error("Database error:", err);
        if (err?.code === "ER_DUP_ENTRY") {
            throw Object.assign(new Error("Session already exists"), { code: 409 });
        }
        if (err.code) {
            throw err;
        }
        throw Object.assign(new Error("Internal database error"), { code: 500 });
    } finally {
        if (connection) await connection.end();
    }
};

export const removeSession = async (userId, teamId, sessionId) => {
    let connection;
    try {
        connection = await newConnection();
        await ensureServeReceiveTables(connection);
        await ensureAuthorizedTeam(connection, userId, teamId);

        await connection.execute(
            `
                DELETE FROM sessions
                WHERE teamId = ? AND sessionId = ?
            `,
            [teamId, sessionId]
        );
    } catch (err) {
        console.error("Database error:", err);
        if (err.code) {
            throw err;
        }
        throw Object.assign(new Error("Internal database error"), { code: 500 });
    } finally {
        if (connection) await connection.end();
    }
};

export const getSessionData = async (userId, teamId, sessionId) => {
    let connection;
    try {
        connection = await newConnection();
        await ensureServeReceiveTables(connection);
        await ensureAuthorizedTeam(connection, userId, teamId);

        const [[session]] = await connection.execute(
            `
                SELECT sessionId, sessionName, createdAt
                FROM sessions
                WHERE teamId = ? AND sessionId = ?
                LIMIT 1
            `,
            [teamId, sessionId]
        );

        if (!session) {
            throw Object.assign(new Error("Session not found"), { code: 404 });
        }

        const [players] = await connection.execute(
            `
                SELECT playerId, playerName
                FROM players
                WHERE teamId = ?
                ORDER BY playerName
            `,
            [teamId]
        );

        const [recentReps] = await connection.execute(
            `
                SELECT repId,
                       sessionId,
                       serverPlayerId,
                       serverName,
                       passerPlayerId,
                       passerName,
                       passRating,
                       serveRating,
                       missedServe,
                       createdAt
                FROM serveReceiveReps
                WHERE teamId = ? AND sessionId = ?
                ORDER BY createdAt DESC, repId DESC
                LIMIT 50
            `,
            [teamId, sessionId]
        );

        return {
            session,
            players,
            recentReps,
        };
    } catch (err) {
        console.error("Database error:", err);
        if (err.code) {
            throw err;
        }
        throw Object.assign(new Error("Internal database error"), { code: 500 });
    } finally {
        if (connection) await connection.end();
    }
};

export const recordServeReceiveRep = async (userId, teamId, sessionId, payload) => {
    let connection;
    try {
        connection = await newConnection();
        await ensureServeReceiveTables(connection);
        await ensureAuthorizedTeam(connection, userId, teamId);

        const { serverPlayerId, passerPlayerId, passRating, missedServe } = payload;

        const [[session]] = await connection.execute(
            `
                SELECT sessionId
                FROM sessions
                WHERE teamId = ? AND sessionId = ?
                LIMIT 1
            `,
            [teamId, sessionId]
        );

        if (!session) {
            throw Object.assign(new Error("Session not found"), { code: 404 });
        }

        const [players] = await connection.execute(
            `
                SELECT playerId, playerName
                FROM players
                WHERE teamId = ? AND playerId IN (?, ?)
            `,
            [teamId, serverPlayerId || -1, passerPlayerId || -1]
        );

        const playerMap = new Map(players.map((player) => [player.playerId, player.playerName]));

        if (!playerMap.has(serverPlayerId)) {
            throw Object.assign(new Error("Server not found"), { code: 400 });
        }

        if (!missedServe && !playerMap.has(passerPlayerId)) {
            throw Object.assign(new Error("Passer not found"), { code: 400 });
        }

        let serveRating;
        let normalizedPassRating = null;

        if (missedServe) {
            serveRating = 0;
        } else {
            normalizedPassRating = Number(passRating);
            if (![0, 1, 2, 3].includes(normalizedPassRating)) {
                throw Object.assign(new Error("Pass rating must be between 0 and 3"), { code: 400 });
            }
            serveRating = normalizedPassRating >= 2 ? 4 - normalizedPassRating : 3;
        }

        const [result] = await connection.execute(
            `
                INSERT INTO serveReceiveReps (
                    teamId,
                    sessionId,
                    serverPlayerId,
                    serverName,
                    passerPlayerId,
                    passerName,
                    passRating,
                    serveRating,
                    missedServe
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                teamId,
                sessionId,
                serverPlayerId,
                playerMap.get(serverPlayerId),
                missedServe ? null : passerPlayerId,
                missedServe ? null : playerMap.get(passerPlayerId),
                normalizedPassRating,
                serveRating,
                missedServe ? 1 : 0,
            ]
        );

        return result.insertId;
    } catch (err) {
        console.error("Database error:", err);
        if (err.code) {
            throw err;
        }
        throw Object.assign(new Error("Internal database error"), { code: 500 });
    } finally {
        if (connection) await connection.end();
    }
};

export const getTeamStats = async (userId, teamId, sessionIds = []) => {
    let connection;
    try {
        connection = await newConnection();
        await ensureServeReceiveTables(connection);
        await ensureAuthorizedTeam(connection, userId, teamId);

        const numericSessionIds = sessionIds
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0);

        let validSessionIds = [];
        if (numericSessionIds.length > 0) {
            const placeholders = numericSessionIds.map(() => "?").join(", ");
            const [rows] = await connection.execute(
                `
                    SELECT sessionId
                    FROM sessions
                    WHERE teamId = ?
                      AND sessionId IN (${placeholders})
                `,
                [teamId, ...numericSessionIds]
            );
            validSessionIds = rows.map((row) => row.sessionId);
        }

        const statsParams = [teamId];
        let sessionFilter = "";
        if (validSessionIds.length > 0) {
            const placeholders = validSessionIds.map(() => "?").join(", ");
            sessionFilter = ` AND sessionId IN (${placeholders})`;
            statsParams.push(...validSessionIds);
        }

        const [sessions] = await connection.execute(
            `
                SELECT s.sessionId,
                       s.sessionName,
                       s.createdAt,
                       COUNT(r.repId) AS totalReps,
                       ROUND(AVG(r.passRating), 2) AS averagePassRating,
                       ROUND(AVG(r.serveRating), 2) AS averageServeRating,
                       SUM(CASE WHEN r.missedServe = 1 THEN 1 ELSE 0 END) AS missedServes
                FROM sessions s
                LEFT JOIN serveReceiveReps r
                    ON r.sessionId = s.sessionId
                WHERE s.teamId = ?
                GROUP BY s.sessionId, s.sessionName, s.createdAt
                ORDER BY s.createdAt DESC, s.sessionId DESC
            `,
            [teamId]
        );

        const [[overall]] = await connection.execute(
            `
                SELECT COUNT(*) AS totalReps,
                       ROUND(AVG(passRating), 2) AS averagePassRating,
                       COUNT(passRating) AS totalPasses,
                       ROUND(AVG(serveRating), 2) AS averageServeRating,
                       COUNT(serveRating) AS totalServes,
                       SUM(CASE WHEN missedServe = 1 THEN 1 ELSE 0 END) AS missedServes
                FROM serveReceiveReps
                WHERE teamId = ?
                ${sessionFilter}
            `,
            statsParams
        );

        const [players] = await connection.execute(
            `
                SELECT base.playerId,
                       base.playerName,
                       COALESCE(passStats.averagePassRating, 0) AS averagePassRating,
                       COALESCE(passStats.totalPasses, 0) AS totalPasses,
                       COALESCE(serveStats.averageServeRating, 0) AS averageServeRating,
                       COALESCE(serveStats.totalServes, 0) AS totalServes,
                       COALESCE(serveStats.missedServes, 0) AS missedServes
                FROM (
                    SELECT playerId, MAX(playerName) AS playerName
                    FROM (
                        SELECT serverPlayerId AS playerId, serverName AS playerName
                        FROM serveReceiveReps
                        WHERE teamId = ?
                        ${sessionFilter}
                        UNION ALL
                        SELECT passerPlayerId AS playerId, passerName AS playerName
                        FROM serveReceiveReps
                        WHERE teamId = ?
                        ${sessionFilter}
                    ) playerRows
                    WHERE playerId IS NOT NULL
                    GROUP BY playerId
                ) base
                LEFT JOIN (
                    SELECT passerPlayerId AS playerId,
                           ROUND(AVG(passRating), 2) AS averagePassRating,
                           COUNT(*) AS totalPasses
                    FROM serveReceiveReps
                    WHERE teamId = ?
                    ${sessionFilter}
                      AND passerPlayerId IS NOT NULL
                      AND passRating IS NOT NULL
                    GROUP BY passerPlayerId
                ) passStats ON passStats.playerId = base.playerId
                LEFT JOIN (
                    SELECT serverPlayerId AS playerId,
                           ROUND(AVG(serveRating), 2) AS averageServeRating,
                           COUNT(*) AS totalServes,
                           SUM(CASE WHEN missedServe = 1 THEN 1 ELSE 0 END) AS missedServes
                    FROM serveReceiveReps
                    WHERE teamId = ?
                    ${sessionFilter}
                      AND serverPlayerId IS NOT NULL
                    GROUP BY serverPlayerId
                ) serveStats ON serveStats.playerId = base.playerId
                ORDER BY base.playerName
            `,
            [
                teamId,
                ...validSessionIds,
                teamId,
                ...validSessionIds,
                teamId,
                ...validSessionIds,
                teamId,
                ...validSessionIds,
            ]
        );

        return {
            selectedSessionIds: validSessionIds,
            sessions,
            overall: overall || {
                totalReps: 0,
                averagePassRating: 0,
                totalPasses: 0,
                averageServeRating: 0,
                totalServes: 0,
                missedServes: 0,
            },
            players,
        };
    } catch (err) {
        console.error("Database error:", err);
        if (err.code) {
            throw err;
        }
        throw Object.assign(new Error("Internal database error"), { code: 500 });
    } finally {
        if (connection) await connection.end();
    }
};
