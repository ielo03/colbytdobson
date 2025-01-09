import startServer from "./src/server/startServer.mjs";

startServer();

process.on("SIGINT", () => {
    connect(false);
    process.exit();
});