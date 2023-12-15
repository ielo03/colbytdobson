import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "../");

const serverConfig = {
    PORT: 3001,
    HOST: 'localhost'
};

const config = {
    serverConfig,
    __dirname
};

export default config;