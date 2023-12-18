import startServer from "./src/server/startServer.js";
import connect from "./src/database/connect.js";

startServer();

process.on("SIGINT", () => {
    connect(false);
    process.exit();
});