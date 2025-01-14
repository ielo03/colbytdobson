// const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg5Y2UzNTk4YzQ3M2FmMWJkYTRiZmY5NWU2Yzg3MzY0NTAyMDZmYmEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxODI3NzEyMzIxMDItYTF2M21uZnQzajY4dDQxbWthOTNxdjRobnFxOTE1bHYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxODI3NzEyMzIxMDItYTF2M21uZnQzajY4dDQxbWthOTNxdjRobnFxOTE1bHYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDYwMzYxODcyNTUzNTM4NTcwMjciLCJlbWFpbCI6ImNvbGJ5dGRvYnNvbkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNzM2ODMzNTI1LCJuYW1lIjoiQ29sYnkgRG9ic29uIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pNM3J4QVpyWjFTN2lTdWVIdUROSVBidlY3SGJ0cTNZeEpncUgtNE5rc2I4MjJrZz1zOTYtYyIsImdpdmVuX25hbWUiOiJDb2xieSIsImZhbWlseV9uYW1lIjoiRG9ic29uIiwiaWF0IjoxNzM2ODMzODI1LCJleHAiOjE3MzY4Mzc0MjUsImp0aSI6IjBkMDUxMjkwNDNiZTc0NDZjYTU2OGJkOTU5NDhiZGZkMmQwZDE3ODUifQ.rsAmozNOgiWlDE8d6B52P47znF2sjtyUht2vFMj6k3uE6hoytTL2UpyrOkYvgf4JmSp40NpLqjvKSfzUG6oAbkCy3xEeBLWuJxQlIDel3Bz39UGUwz-ObSK_P42cSfwRQTaz6tHolTEQ-0eWk9d08C_bzl_1FSoMOduO1lh379-6Mbkbap_FmuQJuHlKQqIdCTFms7hw20eG-rfhYJg4TXfZxNwZg81MzPFBf8SD4sbVc3fLbiVpdYg0rkM5ZBdSoTM6GI2P-gOoiAujrAPrboJwa0k9O6Sll1QXiDc4XwlaGt6Fd1tvyZy7qomEqyAfXVdCv4aEATOCKIYXu_IJGw'
// const res = await fetch("http://localhost:3000/api/auth/login", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ idToken: token }),
// });
// console.log(res);
// console.log(await res.json());
import mysql from "mysql2/promise";
import env from "./environment.mjs";

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: env.db.host,
            port: env.db.port,
            user: env.db.user,
            password: env.db.password,
            database: env.db.database,
        });
        console.log("Database connected successfully");
        await connection.end();
    } catch (error) {
        console.error("Database connection error:", error);
    }
}

testConnection();