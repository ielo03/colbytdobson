import express from "express";
import session from "express-session";
import environment from "../../environment.mjs";

import hbs from "express-handlebars";
import routes from "../../routes/routes.mjs";

const app = express();

app.set("view engine", "hbs");
app.engine(
    "hbs",
    hbs.engine({
        layoutsDir: environment.getPathTo("views/layouts"),
        defaultLayout: "main",
        extname: "hbs"
    })
);

app.use(express.static(environment.getPathTo("public")));

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
    const err = new Error("Page Not Found");
    err.code = 404;
    next(err);
});

app.use((err, req, res) => {
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

export default app;