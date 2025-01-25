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

export async function fetchExistingData(userId) {
    let connection;
    try {
        connection = await newConnection();

        const query = `
                SELECT mt.name AS mainTopic, bp.bulletPoint
                FROM mainTopics mt
                LEFT JOIN bulletPoints bp ON mt.id = bp.mainTopicId
                WHERE mt.userId = ?
                ORDER BY mt.id, bp.id
              `;
        // Fetch main topics and their bullet points for the given userId
        const [rows] = await connection.execute(query, [userId]);

        // Generate the structured object
        return rows.reduce((acc, row) => {
            const {mainTopic, bulletPoint} = row;

            if (!acc[mainTopic]) {
                acc[mainTopic] = [];
            }

            if (bulletPoint) {
                acc[mainTopic].push(bulletPoint);
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

export const getPlayers = async (userId, teamId) => {
    let connection;
    try {
        connection = await newConnection();

        // Insert the user into the `users` table
        const query = `
                SELECT p.playerId, p.playerName, p.averagePassRating,
                       p.totalPasses, p.averageServeRating, p.totalServes FROM players p
                JOIN teamAdmins ta ON p.teamId = ta.teamId
                WHERE ta.userId = ? AND ta.teamId = ?
              `;
        const [result] = await connection.execute(query, [
            userId,
            teamId
        ]);
        console.log("Retrieved players:", result);
        return result;
    } catch (err) {
        console.error("Database error:", err);
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
