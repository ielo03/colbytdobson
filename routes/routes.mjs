import express from "express";
import homeHandler from "../src/server/homeHandler.mjs";
import journeyHandler from "../src/server/journeyHandler.mjs";
import resumeHandler from "../src/server/resumeHandler.mjs";
import projectsHandler from "../src/server/projectsHandler.mjs";

const router = express.Router();

router.get("/", homeHandler.get);
router.get("/journey", journeyHandler.get);
router.get("/resume", resumeHandler.get);
router.get("/projects", projectsHandler.get);

export default router;