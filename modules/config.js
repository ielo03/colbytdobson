import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "../");
const getPathTo = (pathFromRoot) => path.join(__dirname, pathFromRoot);

const serverConfig = {
    port: 3001,
    host: "localhost",
    secret: "this_is_my_little_secret"
};

const databaseConfig = {
    username: "colbytdobson",
    password: "uZBxpPKvLAOngoTa",
    connectionString: "mongodb+srv://colbytdobson:uZBxpPKvLAOngoTa@host.n9swqcw.mongodb.net/portfolio?retryWrites=true&w=majority"
};

const config = {
    serverConfig,
    databaseConfig,
    __dirname,
    getPathTo
};

export default config;