import path from "path";
import {fileURLToPath} from "url";
import dotenv from 'dotenv';
dotenv.config()

const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "../");
const getPathTo = pathFromRoot => path.join(__dirname, pathFromRoot);

const server = {
    port: parseInt(process.env.SERVER_PORT),
    host: process.env.SERVER_HOST,
};

const auth = {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    refreshSecretKey: process.env.REFRESH_SECRET_KEY,
    tokenIssuer: process.env.TOKEN_ISSUER,
    tokenAudience: process.env.TOKEN_AUDIENCE,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    kid: process.env.KID,
    algorithm: process.env.ALGORITHM
};

const db = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

const environment = {
    server,
    auth,
    db,
    __dirname,
    getPathTo
};

export default environment;