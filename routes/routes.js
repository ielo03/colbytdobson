import express from "express";
import homeHandler from "../src/server/homeHandler.js";
import journeyHandler from "../src/server/journeyHandler.js";
import loginHandler from "../src/server/loginHandler.js";
import logoutHandler from "../src/server/logoutHandler.js";
import createPostHandler from "../src/server/createPostHandler.js";
import postHandler from "../src/server/postHandler.js";
import resumeHandler from "../src/server/resumeHandler.js";
import projectsHandler from "../src/server/projectsHandler.js";
import registerHandler from "../src/server/registerHandler.js";

const router = express.Router();

router.get("/", homeHandler.get);
router.get("/journey", journeyHandler.get);
router.get("/login", loginHandler.get);
router.post("/login", loginHandler.post);
router.get("/register", registerHandler.get);
router.post("/register", registerHandler.post);
router.get("/logout", logoutHandler.get);
router.get("/createPost", createPostHandler.get);
router.post("/createPost", createPostHandler.post);
router.get("/post", postHandler.get);
router.get("/resume", resumeHandler.get);
router.get("/projects", projectsHandler.get);

export default router;