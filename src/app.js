//imports enviroment vars
require("dotenv").config()

//import node libs
const express = require("express")
const cookieParser = require('cookie-parser')

//import native node libs
const path = require("node:path")

//import data files (JS)
const { PORT, COOKIE_SECRET_KEY } = require("./utils/env.utils.js")

//import mongodb connection method
const { connectMongo } = require("./db/mongo.db.js")

//import middlewares
const { corsMiddleware } = require('./middlewares/cors.middleware.js')
const { Unlogged } = require('./middlewares/auth-login.middleware.js')

//import routers
const { main_router } = require('./routes/main.router.js')
const { user_router } = require("./routes/users.router.js")

const app = express()

//configurating of views engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views", "ejs"))

//express static images
app.use("/img", express.static(path.join(__dirname, "public", "images")))

//mongodb connection
connectMongo()

//setting middlewares
app.use(corsMiddleware())
app.use(cookieParser(COOKIE_SECRET_KEY))

//setting express routers
app.use("/", main_router)
app.use("/user", Unlogged, user_router)

// app.get("/db/in", async (req, res) => await UsersModel.createEmptyColeccionUsers(req, res))

app.listen(PORT, function () { console.log(`Server Running At PORT ${PORT}`) })