import fs from "fs";
import jwt from "jsonwebtoken";
import env from "../../../environment.mjs";

const ACCESS_PRIVATE_KEY = fs.readFileSync(env.getPathTo("src/auth/api/private.pem"));

export const generateTokens = (userId, name, email, picture) => {
    const accessToken = generateAccessToken(userId, name, email, picture);

    const refreshToken = generateRefreshToken(userId)

    return { accessToken, refreshToken };
}

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