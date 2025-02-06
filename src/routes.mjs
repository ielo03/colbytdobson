import express from "express";
import colbytdobsonHome from "./home/colbytdobsonHome.mjs";
import servereceiveHome from "./servereceive/servereceiveHome.mjs";
import dynamicresumeHome from "./dynamicresume/dynamicresumeHome.mjs";
import authAPIHandler from "./auth/authAPIHandler.mjs";
import servereceiveTeam from "./servereceive/servereceiveTeam.mjs";
import servereceiveSession from "./servereceive/servereceiveSession.mjs";
import servereceiveAPIHandler from "./servereceive/servereceiveAPIHandler.mjs";
import dynamicresumeAPIHandler from "./dynamicresume/dynamicresumeAPIHandler.mjs";
import shortcuts from "./shortcuts.mjs";
import colbytdobsonResume from "./home/colbytdobsonResume.mjs";
import questionablecocktailsAbout from "./questionablecocktails/questionablecocktailsAbout.mjs";
import questionablecocktailsHome from "./questionablecocktails/questionablecocktailsHome.mjs";
import questionablecocktailsAPIHandler from "./questionablecocktails/questionablecocktailsAPIHandler.mjs";

const router = express.Router();

router.get("/", colbytdobsonHome.get);
router.get("/resume", colbytdobsonResume.get);
router.get("/sr", shortcuts.servereceive);
router.get("/sr/*path", shortcuts.servereceive);
router.get("/dr", shortcuts.dynamicresume);
router.get("/qc", shortcuts.questionablecocktails);
router.get("/qc/*path", shortcuts.questionablecocktails);
router.get("/r", shortcuts.myresume);
router.get("/servereceive", servereceiveHome.get);
router.get("/servereceive/:teamName", servereceiveTeam.get);
router.get("/servereceive/:teamName/:sessionName", servereceiveSession.get);
router.get("/dynamicresume", dynamicresumeHome.get);
router.get("/questionablecocktails", questionablecocktailsHome.get);
router.get("/questionablecocktails/about", questionablecocktailsAbout.get);
router.all("/api/auth/*path", authAPIHandler);
router.all("/api/servereceive/*path", servereceiveAPIHandler);
router.all("/api/dynamicresume/*path", dynamicresumeAPIHandler);
router.all("/api/questionablecocktails/*path", questionablecocktailsAPIHandler);

export default router;