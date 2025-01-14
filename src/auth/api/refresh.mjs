import {generateAccessTokenFromRefresh} from "./authUtils.mjs";

async function post(req, res) {
    try {
        // // Extract the refresh token from cookies
        // const cookieHeader = req.headers.cookie;
        //
        // if (!cookieHeader) {
        //     return res.status(400).json({ error: "No cookies found in the request" });
        // }
        //
        // // Parse the refreshToken from the Cookie header
        // const cookies = cookieHeader.split("; ").reduce((acc, cookie) => {
        //     const [key, value] = cookie.split("=");
        //     acc[key] = value;
        //     return acc;
        // }, {});

        res.status(200).json({ accessToken: await generateAccessTokenFromRefresh(req.cookies.refreshToken) });
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