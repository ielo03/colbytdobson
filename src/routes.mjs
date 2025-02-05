import express from "express";
import colbytdobsonHome from "./home/colbytdobsonHome.mjs";
import servereceiveHome from "./servereceive/servereceiveHome.mjs";
import dynamicresumeHome from "./dynamicresume/dynamicresumeHome.mjs";
import authAPIHandler from "./auth/authAPIHandler.mjs";
import servereceiveTeam from "./servereceive/servereceiveTeam.mjs";
import servereceiveSession from "./servereceive/servereceiveSession.mjs";
import servereceiveAPIHandler from "./servereceive/servereceiveAPIHandler.mjs";
import dynamicresumeAPIHandler from "./dynamicresume/dynamicresumeAPIHandler.mjs";
import servereceiveShortcut from "./servereceive/servereceiveShortcut.mjs";
import colbytdobsonResume from "./home/colbytdobsonResume.mjs";

const router = express.Router();

router.get("/", colbytdobsonHome.get);
router.get("/resume", colbytdobsonResume.get);
router.get("/sr", servereceiveShortcut.get);
router.get("/sr/*path", servereceiveShortcut.get);
router.get("/servereceive", servereceiveHome.get);
router.get("/servereceive/:teamName", servereceiveTeam.get);
router.get("/servereceive/:teamName/:sessionName", servereceiveSession.get);
router.get("/dynamicresume", dynamicresumeHome.get);
router.all("/api/auth/*path", authAPIHandler);
router.all("/api/servereceive/*path", servereceiveAPIHandler);
router.all("/api/dynamicresume/*path", dynamicresumeAPIHandler);

export default router;