import app from "./server.mjs";
import environment from "../../environment.mjs";

function startServer() {
    const port = environment.serverConfig.port || 3000;
    const host = environment.serverConfig.host || "localhost";
    app.listen(port, host, () => {
        console.log(`Server running at ${host}:${port}`);
    });
}

export default startServer;