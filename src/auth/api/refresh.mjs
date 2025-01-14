import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { generateAccessToken } from "./authUtils.mjs";
import {newConnection} from "../../dbUtils.mjs";

async function post(req, res) {
    try {
        // Extract the refresh token from cookies
        const cookieHeader = req.headers.cookie;

        if (!cookieHeader) {
            return res.status(400).json({ error: "No cookies found in the request" });
        }

        // Parse the refreshToken from the Cookie header
        const cookies = cookieHeader.split("; ").reduce((acc, cookie) => {
            const [key, value] = cookie.split("=");
            acc[key] = value;
            return acc;
        }, {});

        const refreshToken = cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is missing" });
        }

        // Verify the refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
        } catch (err) {
            console.error("Invalid refresh token:", err.message);
            res.setHeader("Set-Cookie", [
                "refreshToken=; HttpOnly; Path=/; Max-Age=0",
                "refreshTokenExists=true; HttpOnly; Path=/; Max-Age=0",
            ]);
            return res.status(403).json({ message: "Invalid refreshToken. Logged out." });
        }

        const { userId } = decoded;
        if (!userId) {
            return res.status(401).json({ error: "Token not verified" });
        }

        let name, email, picture;
        let connection;

        try {
            connection = await newConnection();

            console.log("Connected to the database");

            // Query the user from the database
            const query = `SELECT * FROM users WHERE userId = ?`;
            const [rows] = await connection.execute(query, [userId]);

            if (rows.length > 0) {
                const user = rows[0];
                name = user.name;
                email = user.email;
                picture = user.picture;
            } else {
                return res.status(404).json({ error: "User not found" });
            }
        } catch (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal database error" });
        } finally {
            if (connection) await connection.end();
        }

        console.log(JSON.stringify({ userId, name, email, picture }));

        // Generate a new access token
        const newAccessToken = generateAccessToken(userId, name, email, picture);

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.error("Error refreshing token:", error.message);

        res.setHeader("Set-Cookie", [
            "refreshToken=; HttpOnly; Path=/; Max-Age=0",
            "refreshTokenExists=true; HttpOnly; Path=/; Max-Age=0",
        ]);

        return res.status(403).json({ message: "Invalid refreshToken. Logged out." });
    }
}

export default {
    post,
};