import {OAuth2Client} from "google-auth-library";
import env from "../../../environment.mjs"
import {generateTokens} from "../../utils/authUtils.mjs";
import {newConnection} from "../../utils/dbUtils.mjs";

const client = new OAuth2Client(env.auth.googleClientId);

async function post(req, res) {
    try {
        console.log("Received event:", req.body);

        const { idToken } = req.body;

        if (!idToken || typeof idToken !== "string") {
            console.error("ID token is missing or invalid");
            return res.status(400).json({ error: "Valid ID token required" });
        }

        let ticket;
        try {
            console.log("Verifying ID token...");
            ticket = await client.verifyIdToken({
                idToken,
                audience: env.auth.googleClientId,
            });
            console.log(`ID Token verified: ${JSON.stringify(ticket)}`);
        } catch (err) {
            console.log(`Error verifying ID token: ${err}`);
            if (err.code === "ENOTFOUND") {
                return res.status(500).json({
                    error: "verification_certificate_error",
                    error_description: "Failed to retrieve verification certificates.",
                });
            } else {
                return res.status(401).json({
                    error: "invalid_token",
                    error_description: "The access token is missing or invalid.",
                });
            }
        }
        console.log("Retrieving payload");

        const payload = ticket.getPayload();
        if (!payload) {
            console.error("Failed to retrieve token payload");
            return res.status(401).json({ error: "Invalid ID token payload" });
        }

        const { sub: userId, name, email, picture } = payload;

        console.log(`User authenticated successfully: ${email}`);

        let connection;
        try {
            connection = await newConnection();

            console.log("Connected to the database");

            // Insert the user into the `users` table
            const query = `
                INSERT INTO users (userId, name, email, picture)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name = VALUES(name), picture = VALUES(picture);
              `;
            const [result] = await connection.execute(query, [
                userId,
                name,
                email,
                picture
            ]);
            console.log("User inserted/updated in the database:", result);
        } catch (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal database error" });
        } finally {
            if (connection) await connection.end();
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(userId, name, email, picture);

        const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        const refreshTokenExpiry = Date.now() + REFRESH_TOKEN_EXPIRY_MS;

        res.setHeader("Set-Cookie", [
            `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${REFRESH_TOKEN_EXPIRY_MS / 1000}`,
            `refreshTokenExpiry=${refreshTokenExpiry}; Secure; SameSite=Strict; Path=/;`,
        ]);

        res.status(200).json({ accessToken });
    } catch (error) {
        console.error("Error processing request:", error.message || error.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default {
    post
};