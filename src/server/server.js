import express from "express";
import session from "express-session";
import mongo from "connect-mongo";
import config from "../../modules/config.js";

import connect from "../database/connect.js";
import hbs from "express-handlebars";
import homeHandler from "./homeHandler.js";
import journeyHandler from "./journeyHandler.js";
import loginHandler from "./loginHandler.js";
import registerHandler from "./registerHandler.js";
import logoutHandler from "./logoutHandler.js"
import createPostHandler from "./createPostHandler.js";
import postHandler from "./postHandler.js";
import resumeHandler from "./resumeHandler.js";
import projectsHandler from "./projectsHandler.js";

const app = express();

connect(true);

app.set("view engine", "hbs");
app.engine(
    "hbs",
    hbs.engine({
        layoutsDir: config.getPathTo("views/layouts"),
        defaultLayout: "main",
        extname: "hbs"
    })
);

app.use(express.static(config.getPathTo("public")));

app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.use(session({
    secret: config.serverConfig.secret,
    resave: false,
    saveUninitialized: false,
    store: mongo.create({mongoUrl: config.databaseConfig.connectionString}),
    cookie: {maxAge: 1000 * 60 * 60 * 24}
}));

app.get("/", function (req, res, next) {
    homeHandler.get(req, res, next);
});

app.get("/journey", function (req, res, next) {
    journeyHandler.get(req, res, next);
});

app.get("/login", function (req, res, next) {
    loginHandler.get(req, res, next);
});
app.post("/login", function (req, res, next) {
    loginHandler.post(req, res, next);
});

app.get("/register", function (req, res, next) {
    registerHandler.get(req, res, next);
});
app.post("/register", function (req, res, next) {
    registerHandler.post(req, res, next);
});

app.get("/logout", function (req, res, next) {
    logoutHandler.get(req, res, next);
});

app.get("/createPost", function (req, res, next) {
    createPostHandler.get(req, res, next);
});

app.post("/createPost", function (req, res, next) {
    createPostHandler.post(req, res, next);
});

app.get("/post", function (req, res, next) {
    postHandler.get(req, res, next);
});

app.get("/resume", function (req, res, next) {
    resumeHandler.get(req, res, next);
});

app.get("/projects", function (req, res, next) {
    projectsHandler.get(req, res, next);
});

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