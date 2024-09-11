import startServer from "./src/server/startServer.js";

startServer();

process.on("SIGINT", () => {
    connect(false);
    process.exit();
});