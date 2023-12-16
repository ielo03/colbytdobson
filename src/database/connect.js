import config from "../../modules/config.js";
import mongoose from "mongoose";

function connect(blnOpen) {
    if (blnOpen) {
        mongoose.connect(config.databaseConfig.connectionString).then(
            () => {
                let conn = mongoose.connection;
                console.log(
                    `Database is connected on ${new Date().toLocaleString()}: ${
                        conn.host
                    }:${conn.port} @ ${conn.name}`
                );
            },
            (err) => {
                console.log("Problem while connecting database " + err);
            }
        );
    } else {
        mongoose.connection.close().then(
            () => {
                console.log(
                    `MongoDB connection closed on ${new Date().toLocaleString()}`
                );
            },
            (err) => {
                console.log("Problem while closing database " + err);
            }
        );
    }
}

export default connect;
