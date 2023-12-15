import express from 'express';
const app = express();

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../");

import hbs from 'express-handlebars';

app.set("view engine", "hbs");
app.engine(
    "hbs",
    hbs.engine({
        layoutsDir: path.join(__dirname, "views/layouts"),
        defaultLayout: "main",
        extname: "hbs",
    })
);

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, resp) {
    resp.render("home");
});

export default app;