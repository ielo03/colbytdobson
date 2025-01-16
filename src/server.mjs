import express from "express";
// import session from "express-session";
import env from "../environment.mjs";

import hbs from "express-handlebars";
import routes from "./routes.mjs";
import {validateAccessToken} from "./utils/authUtils.mjs";

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

// app.use(session({
//     secret: environment.serverConfig.secret,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {maxAge: 1000 * 60 * 60 * 24}
// }));

app.use((req, res, next) => {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
        req.cookies = {}; // Ensure req.cookies is always defined
        return next(); // Continue even if there are no cookies
    }

    // Parse the cookies from the Cookie header
    req.cookies = cookieHeader.split("; ").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key] = decodeURIComponent(value); // Decode URI-encoded values
        return acc;
    }, {});

    next();
});

app.use((req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        req.user = null; // No user if no Authorization header is present
        return next();
    }

    const token = authHeader.split(" ")[1]; // Expecting "Bearer <token>"

    if (!token) {
        console.log("Invalid Authorization header format");
        next();
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