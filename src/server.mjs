import express from "express";
import cookieParser from "cookie-parser";
import env from "../environment.mjs";

import hbs from "express-handlebars";
import routes from "./routes.mjs";
import {generateAccessTokenFromRefresh, validateAccessToken} from "./utils/authUtils.mjs";

const app = express();

app.set("view engine", "hbs");
app.engine(
    "hbs",
    hbs.engine({
        layoutsDir: env.getPathTo("views/layouts"),
        defaultLayout: "main",
        extname: "hbs"
    })
);

app.set("views", env.getPathTo("views"));

app.use(express.static(env.getPathTo("public")));

app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.use(cookieParser());

app.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const refreshToken = req.cookies.refreshToken;

    if (!authHeader && !refreshToken) {
        req.user = null; // No user if no Authorization header is present
        return next();
    }

    let token;
    if (authHeader) {
        token = authHeader.split(" ")[1]; // Expecting "Bearer <token>"

        if (!token) {
            console.error("Authorization header missing token.");
            return res.status(401).send("Unauthorized");
        }
    } else {
        token = await generateAccessTokenFromRefresh(refreshToken);
    }

    try {
        // Validate the token and extract payload
        req.user = validateAccessToken(token);

        next(); // Continue to the next middleware
    } catch (err) {
        console.error("Token validation error:", err);
        next();
    }
});

app.use(routes);

app.use((req, res, next) => {
    const err = new Error("Page Not Found: " + req.url);
    err.code = 404;
    next(err);
});

app.use((err, req, res, next) => {
    const code = err.code || 500;
    const message = err.message || "Internal Server Error";
    const context = {
        code,
        message
    };
    res
        .status(code)
        .render("error", context);
});

const startServer = () => {
    const port = env.server.port || 3000;
    const host = env.server.host || "localhost";
    app.listen(port, host, () => {
        console.log(`Server running at ${host}:${port}`);
    });
};

export default startServer;