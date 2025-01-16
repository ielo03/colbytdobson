import fs from "fs";
import jwt from "jsonwebtoken";
import {Buffer} from "buffer";
import env from "../../environment.mjs";
import {newConnection} from "./dbUtils.mjs";
import { createPublicKey } from "crypto";

const ACCESS_PRIVATE_KEY = fs.readFileSync(env.getPathTo("src/auth/api/private.pem"));

export const generateTokens = (userId, name, email, picture) => {
    const accessToken = generateAccessToken(userId, name, email, picture);

    const refreshToken = generateRefreshToken(userId)

    return { accessToken, refreshToken };
}

const getRSAPublicKey = () => {
    const { n, e } = env.auth;

    if (!n || !e) {
        throw new Error("Missing RSA public key components (n or e) in environment variables.");
    }

    const jwk = {
        kty: "RSA",          // Key Type
        n,                  // Base64URL-encoded modulus
        e                   // Base64URL-encoded exponent
    };

    // Construct the RSA public key
    const publicKey = createPublicKey({
        key: jwk,
        format: "jwk", // JSON Web Key format
    });

    return publicKey.export({ type: "pkcs1", format: "pem" });
};

export const validateAccessToken = (accessToken) => {
    try {
        // Retrieve the RSA public key
        const publicKey = getRSAPublicKey();

        // Verify the token
        // Return the decoded token payload
        return jwt.verify(accessToken, publicKey, {
            algorithms: [env.auth.algorithm],
            audience: env.auth.tokenAudience,
            issuer: env.auth.tokenIssuer,
        });
    } catch (error) {
        console.error("Error validating access token:", error.message || error);
        throw Object.assign(new Error("Unauthorized"), { code: 401 });
    }
};

export const generateAccessToken = (userId, name, email, picture) => {
    try {
        return jwt.sign(
            {
                userId,
                name,
                email,
                picture,
                aud: env.auth.tokenAudience,
                iss: env.auth.tokenIssuer,
            },
            ACCESS_PRIVATE_KEY,
            {
                algorithm: env.auth.algorithm,
                expiresIn: env.auth.accessTokenExpiry,
                header: {
                    kid: env.auth.kid,
                },
            }
        );
    } catch (error) {
        console.error("Error generating access token:", error.message || error);
        throw new Error("Token generation failed");
    }
};

export const generateAccessTokenFromRefresh = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error(`No refresh token included`);
    }

    // Verify the refresh token
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
    } catch (err) {
        throw new Error(`Invalid refresh token: ${err.message}`);
    }

    const { userId } = decoded;
    if (!userId) {
        throw new Error(`No userid in token`);
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
            throw new Error(`User not found`);
        }
    } catch (err) {
        throw new Error(`Database error: ${err.message}`);
    } finally {
        if (connection) await connection.end();
    }

    console.log(JSON.stringify({ userId, name, email, picture }));

    // Generate a new access token
    return generateAccessToken(userId, name, email, picture);
};

export const generateRefreshToken = (userId) => {
    try {
        return jwt.sign(
            {
                userId,
            },
            env.auth.refreshSecretKey,
            {expiresIn: env.auth.refreshTokenExpiry}
        );
    } catch (error) {
        console.error("Error generating refresh token:", error.message || error);
        throw new Error("Token generation failed");
    }
};