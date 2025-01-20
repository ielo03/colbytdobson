import {getTeamId, newConnection} from "../../utils/dbUtils.mjs";

const post = async (req, res) => {
    try {
        console.log("Received event:", req.body);

        if (!req.user?.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { teamName, playerName } = req.body;

        if (
            !teamName ||
            typeof teamName !== "string" ||
            teamName.length > 20 ||
            !/^[a-z0-9_\-'.]+$/.test(teamName) ||
            !playerName ||
            typeof playerName !== "string"
        ) {
            console.error("Team or player name invalid");
            return res.status(400).json({ error: "Team or player name invalid" });
        }

        const teamId = await getTeamId(req.user?.userId, teamName);

        let connection;
        try {
            connection = await newConnection();
            console.log("Connected to the database");
            // Start a transaction
            // Insert into teams
            const [result] = await connection.execute(
                `INSERT INTO players (teamId, playerName) VALUES (?, ?)`,
                [teamId, playerName]
            );
            // Get the auto-incremented teamId
            const playerId = result.insertId;
            console.log("Player created successfully:", playerId);
            return res.status(201).json({ message: "Player created"});
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