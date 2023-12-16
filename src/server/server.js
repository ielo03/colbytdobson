import express from "express";

const app = express();

import config from "../../modules/config.js";

import hbs from "express-handlebars";

app.set("view engine", "hbs");
app.engine(
    "hbs",
    hbs.engine({
        layoutsDir: config.getPathTo("views/layouts"),
        defaultLayout: "main",
        extname: "hbs"
    })
);

app.use(express.urlencoded({extended: true}));

app.use(express.static(config.getPathTo("public")));

import homeHandler from './homeHandler.js';
app.get("/", function (req, resp) { homeHandler.get(req, resp); });

import journeyHandler from './journeyHandler.js';
app.get("/journey", function (req, resp) { journeyHandler.get(req, resp); });

app.use((req, res, next) => {
    const err = new Error("Page Not Found");
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

export default app;