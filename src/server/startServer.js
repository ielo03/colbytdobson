import app from "./server.js";
import config from "../../modules/config.js";

function startServer() {
    const port = config.serverConfig.port || 3000;
    const host = config.serverConfig.host || "localhost";
    app.listen(port, host, () => {
        console.log(`Server running at ${host}:${port}`);
    });
}

export default startServer;