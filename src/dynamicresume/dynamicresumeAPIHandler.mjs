import data from "./api/data.mjs";

const dynamicresumeAPIHandler = (req, res) => {
    if (!req.user?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const route = decodeURIComponent(req.params.path);

    switch (`${req.method.toUpperCase()}/${route}`) {
        case 'POST/data': {
            return data.post(req, res);
        }

        case 'GET/data': {
            return data.get(req, res);
        }

        default: {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Not Found' }));
        }
    }
};

export default dynamicresumeAPIHandler;