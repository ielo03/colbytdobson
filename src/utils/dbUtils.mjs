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

export const getTeams = async (userId) => {
    let connection;
    try {
        connection = await newConnection();

        console.log("Connected to the database");

        // Insert the user into the `users` table
        const query = `
                SELECT t.id, t.teamName, ta.lastAccessed
                FROM teamAdmins ta
                JOIN teams t ON ta.teamId = t.id
                WHERE ta.userId = ? ORDER BY ta.lastAccessed DESC
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

        console.log("Connected to the database");

        // Insert the user into the `users` table
        const query = `
                SELECT * FROM players p
                JOIN teamAdmins ta ON p.teamId = ta.teamId
                WHERE ta.userId = ? AND ta.teamId = ?
              `;
        const [result] = await connection.execute(query, [
            userId,
            teamId
        ]);
        console.log("User inserted/updated in the database:", result);
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

        console.log("Connected to the database");

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
        connection = newConnection();
        const query = `UPDATE teamAdmins SET teamId = teamId WHERE teamId = ?`; // Triggers ON UPDATE without actual changes
        await connection.query(query, [teamId]);
    } catch (err) {
        console.error("Database error:", err);
        throw new Error("Internal database error");
    } finally {
        if (connection) await connection.end();
    }
};

