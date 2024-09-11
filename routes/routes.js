import express from "express";
import homeHandler from "../src/server/homeHandler.js";
import journeyHandler from "../src/server/journeyHandler.js";
import resumeHandler from "../src/server/resumeHandler.js";
import projectsHandler from "../src/server/projectsHandler.js";

const router = express.Router();

router.get("/", homeHandler.get);
router.get("/journey", journeyHandler.get);
router.get("/resume", resumeHandler.get);
router.get("/projects", projectsHandler.get);

export default router;