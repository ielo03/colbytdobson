import team from "./api/team.mjs";
import teams from "./api/teams.mjs";
import players from "./api/players.mjs";
import player from "./api/player.mjs";
import sessions from "./api/sessions.mjs";
import session from "./api/session.mjs";
import rep from "./api/rep.mjs";
import stats from "./api/stats.mjs";

const servereceiveAPIHandler = (req, res) => {
    if (!req.user?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

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

        case 'POST/player': {
            return player.post(req, res);
        }

        case 'DELETE/player': {
            return player.del(req, res);
        }

        case 'GET/sessions': {
            return sessions.get(req, res);
        }

        case 'POST/session': {
            return sessions.post(req, res);
        }

        case 'DELETE/session': {
            return sessions.del(req, res);
        }

        case 'GET/session': {
            return session.get(req, res);
        }

        case 'POST/rep': {
            return rep.post(req, res);
        }

        case 'GET/stats': {
            return stats.get(req, res);
        }

        default: {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Not Found' }));
        }
    }
};

export default servereceiveAPIHandler;
