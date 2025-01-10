import startServer from "./src/server/startServer.mjs";

startServer();

process.on("SIGINT", () => {
    process.exit();
});