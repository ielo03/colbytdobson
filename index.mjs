import startServer from "./src/server.mjs";

startServer();

process.on("SIGINT", () => {
    process.exit();
});