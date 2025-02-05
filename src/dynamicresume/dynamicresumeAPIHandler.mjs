import data from "./api/data.mjs";
import bulletPoint from "./api/bulletPoint.mjs";
import mainTopic from "./api/mainTopic.mjs";
import resume from "./api/resume.mjs";

const dynamicresumeAPIHandler = (req, res) => {
    if (!req.user?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const route = decodeURIComponent(req.params.path);

    switch (`${req.method.toUpperCase()}/${route}`) {
        // Main Topic Endpoints
        case 'POST/main-topic': {
            return mainTopic.post(req, res);
        }
        case 'PUT/main-topic': {
            return mainTopic.put(req, res);
        }
        case 'DELETE/main-topic': {
            return mainTopic.del(req, res);
        }

        // Data Endpoints
        case 'POST/data': {
            return data.post(req, res);
        }
        case 'GET/data': {
            return data.get(req, res);
        }

        // Bullet Point Endpoints
        case 'POST/bullet-point': {
            return bulletPoint.post(req, res);
        }
        case 'PUT/bullet-point': {
            return bulletPoint.put(req, res);
        }
        case 'DELETE/bullet-point': {
            return bulletPoint.del(req, res);
        }

        // Resume Endpoints
        case 'POST/resume': {
            return resume.post(req, res);
        }
        case 'GET/resumes': {
            return resume.get(req, res);
        }
        case 'DELETE/resume': {
            return resume.del(req, res);
        }

        default: {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Not Found' }));
        }
    }
};

export default dynamicresumeAPIHandler;
