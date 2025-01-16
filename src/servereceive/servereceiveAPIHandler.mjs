import team from "./api/team.mjs";
import teams from "./api/teams.mjs";

const servereceiveAPIHandler = (req, res) => {
    const basePath = '/api/servereceive';

    if (!req.url.startsWith(basePath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Not Found' }));
    }

    const route = req.url.slice(basePath.length).toLowerCase();

    switch (`${req.method.toUpperCase()}${route}`) {
        case 'POST/team': {
            return team.post(req, res);
        }

        case 'GET/teams': {
            return teams.get(req, res);
        }

        default: {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Not Found' }));
        }
    }
};

export default servereceiveAPIHandler;