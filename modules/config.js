import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "../");
const getPathTo = pathFromRoot => path.join(__dirname, pathFromRoot);

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

const appName = "Colby T. Dobson";

const adminId = "658126ebd50e78888c9f634d";

const config = {
    serverConfig,
    databaseConfig,
    __dirname,
    getPathTo,
    appName,
    adminId
};

export default config;