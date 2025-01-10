import startServer from "./src/server/startServer.mjs";

startServer();
// test push

process.on("SIGINT", () => {
    process.exit();
});