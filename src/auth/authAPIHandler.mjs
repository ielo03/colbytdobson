import login from './api/login.mjs';
import logout from './api/logout.mjs';
import refresh from "./api/refresh.mjs";

const authAPIHandler = (req, res) => {
    const route = decodeURIComponent(req.params.path);

    switch (`${req.method.toUpperCase()}/${route}`) {
        case 'POST/login': {
            return login.post(req, res);
        }

        case 'POST/logout': {
            return logout.post(req, res);
        }

        case 'POST/refresh': {
            return refresh.post(req, res);
        }

        default: {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Not Found' }));
        }
    }
};

export default authAPIHandler;