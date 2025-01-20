import {generateAccessTokenFromRefresh} from "../../utils/authUtils.mjs";

async function post(req, res) {
    try {
        res.status(200).json({ accessToken: await generateAccessTokenFromRefresh(req.cookies.refreshToken) });
    } catch (error) {
        console.error("Error refreshing token:", error.message);

        // res.cookie('refreshToken', '', {
        //     httpOnly: true,
        //     path: '/',
        //     maxAge: 0 // Deletes the cookie by setting its age to 0
        // });
        //
        // res.cookie('refreshTokenExpiry', '0', {
        //     path: '/',
        //     maxAge: 0 // Deletes the cookie by setting its age to 0
        // });

        return res.status(403).json({ message: "Invalid refreshToken. Logged out." });
    }
}

export default {
    post,
};