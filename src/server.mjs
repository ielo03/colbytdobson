import express from "express";
import session from "express-session";
import environment from "../environment.mjs";
import env from "../environment.mjs";

import hbs from "express-handlebars";
import routes from "./routes.mjs";

const app = express();

app.set("view engine", "hbs");
app.engine(
    "hbs",
    hbs.engine({
        layoutsDir: environment.getPathTo("colbytdobson/views/layouts"),
        defaultLayout: "main",
        extname: "hbs"
    })
);

app.set("views", environment.getPathTo("colbytdobson/views"));

app.use(express.static(environment.getPathTo("colbytdobson/public")));

app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.use(session({
    secret: environment.serverConfig.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24}
}));

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
    const port = env.serverConfig.port || 3000;
    const host = env.serverConfig.host || "localhost";
    app.listen(port, host, () => {
        console.log(`Server running at ${host}:${port}`);
    });
};

export default startServer;