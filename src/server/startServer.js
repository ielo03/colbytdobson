import app from './server.js';
import config from '../../modules/config.js';

function startServer() {
    const PORT = config.serverConfig.PORT || 3001;
    const HOST = config.serverConfig.HOST || 'localhost';
    app.listen(PORT, HOST, () => {
        console.log(`Server running at ${HOST}:${PORT}`);
    });
}

export default startServer;