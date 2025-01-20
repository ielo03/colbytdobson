import {newConnection} from "../../utils/dbUtils.mjs";

const post = async (req, res) => {
    try {
        console.log("Received event:", req.body);

        if (!req.user?.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { teamName } = req.body;

        if (
            !teamName ||
            typeof teamName !== "string" ||
            teamName.length > 20 ||
            !/^[a-z0-9_\-'.]+$/.test(teamName)
        ) {
            console.error("Team name invalid");
            return res.status(400).json({ error: "Team name invalid" });
        }

        let connection;
        try {
            connection = await newConnection();
            console.log("Connected to the database");
            // Start a transaction
            await connection.beginTransaction();
            // Insert into teams
            const [teamResult] = await connection.execute(
                `INSERT INTO teams (teamName, userId) VALUES (?, ?)`,
                [teamName, req.user.userId]
            );
            // Get the auto-incremented teamId
            const teamId = teamResult.insertId;
            // Insert into teamAdmins
            await connection.execute(
                `INSERT INTO teamAdmins (teamId, userId, teamName) VALUES (?, ?, ?)`,
                [teamId, req.user.userId, teamName]
            );
            // Commit the transaction
            await connection.commit();
            console.log("Team and admin created successfully:", teamId);
            return res.status(201).json({ message: "Team and admin created", teamId });
        } catch (err) {
            console.error("Database error:", err);
            // Rollback the transaction in case of an error
            if (connection) await connection.rollback();
            return res.status(500).json({ error: "Internal database error" });
        } finally {
            if (connection) await connection.end();
        }
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export default {
    post
};