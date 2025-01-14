import mysql from "mysql2/promise";
import env from "../environment.mjs";

export const newConnection = () => {
    return mysql.createConnection({
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        database: env.db.database,
    });
}