import path from "path";
import {fileURLToPath} from "url";
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

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
    algorithm: process.env.ALGORITHM,
    n: process.env.N,
    e: process.env.E
};

const db = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

const bedrock = {
    modelId: process.env.BEDROCK_MODEL_ID
}

const environment = {
    server,
    auth,
    db,
    bedrock,
    __dirname,
    getPathTo
};

export default environment;