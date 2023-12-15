import app from './server.js';

function startServer() {
    const PORT = process.env.PORT || 3001;
    const HOST = process.env.HOST || 'localhost';
    app.listen(PORT, HOST, () => {
        console.log(`Server running at ${HOST}:${PORT}`);
    });
}

export default startServer;