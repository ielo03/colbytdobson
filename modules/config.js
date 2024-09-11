import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "../");
const getPathTo = pathFromRoot => path.join(__dirname, pathFromRoot);

const serverConfig = {
    port: 3000,
    host: "localhost",
    secret: "this_is_my_little_secret"
};

const appName = "Colby T. Dobson";

const config = {
    serverConfig,
    __dirname,
    getPathTo,
    appName
};

export default config;