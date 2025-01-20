import team from "./api/team.mjs";
import teams from "./api/teams.mjs";
import players from "./api/players.mjs";

const servereceiveAPIHandler = (req, res) => {
    const route = decodeURIComponent(req.params.path);

    switch (`${req.method.toUpperCase()}/${route}`) {
        case 'POST/team': {
            return team.post(req, res);
        }

        case 'GET/teams': {
            return teams.get(req, res);
        }

        case 'GET/players': {
            return players.get(req, res);
        }

        default: {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Not Found' }));
        }
    }
};

export default servereceiveAPIHandler;