import express from "express";
import colbytdobsonHome from "./home/colbytdobsonHome.mjs";
import servereceiveHome from "./servereceive/servereceiveHome.mjs";
import dynamicresumeHome from "./dynamicresume/dynamicresumeHome.mjs";
import authorizationAPIHandler from "./authorization/authorizationAPIHandler.mjs";
import servereceiveTeam from "./servereceive/servereceiveTeam.mjs";
import servereceiveSession from "./servereceive/servereceiveSession.mjs";
import servereceiveAPIHandler from "./servereceive/servereceiveAPIHandler.mjs";
import dynamicresumeAPIHandler from "./dynamicresume/dynamicresumeAPIHandler.mjs";
import servereceiveShortcut from "./servereceive/servereceiveShortcut.mjs";

const router = express.Router();

router.get("/", colbytdobsonHome.get);
router.get("/sr", servereceiveShortcut.get);
router.get("/sr/*path", servereceiveShortcut.get);
router.get("/servereceive", servereceiveHome.get);
router.get("/servereceive/:team", servereceiveTeam.get);
router.get("/servereceive/:team/:session", servereceiveSession.get);
router.get("/dynamicresume", dynamicresumeHome.get);
router.all("/api/authorization", authorizationAPIHandler);
router.all("/api/servereceive", servereceiveAPIHandler);
router.all("/api/dynamicresume", dynamicresumeAPIHandler);

export default router;