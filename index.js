import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./db/connection.js"
import { startApp } from "./src/app.router.js"
import { checkDataBase, sendEmails } from "./src/utils/cronjobs.js"
dotenv.config()
const app = express()
const port = process.env.PORT


connectDB()
startApp(app, express)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
