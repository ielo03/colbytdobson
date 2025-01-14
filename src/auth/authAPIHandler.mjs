import login from './api/login.mjs';
import logout from './api/logout.mjs';

const authAPIHandler = (req, res) => {
    const basePath = '/api/auth';

    if (!req.url.startsWith(basePath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Not Found' }));
    }

    const route = req.url.slice(basePath.length).toLowerCase();

    switch (`${req.method.toUpperCase()}${route}`) {
        case 'POST/login': {
            return login.post(req, res);
        }

        case 'POST/logout': {
            return logout.post(req, res);
        }

        default: {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Not Found' }));
        }
    }
};

export default authAPIHandler;