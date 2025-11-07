const express = require('express')
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const axios = require("axios")

const { JWT_SECRET_KEY } = require("../utils/env.utils.js")

const { title } = require("../utils/data.utils.js")

const { Logged, Unlogged } = require('../middlewares/auth-login.middleware.js')

const app = express.Router()

app.get("/", function (req, res) {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    res.redirect("/dashboard")
})

app.get("/dashboard", Unlogged, async function (req, res) {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    const promise = await axios.get(`${req.protocol}://${req.get("host")}/service/get-services`, {
        timeout: 15000
    }).catch((err) => {
        return {
            status: 200,
            data: {
                status: 204,
                msg: "no data"
            }
        }
    })

    // console.log(promise)
    // console.log(promise.length)
    console.log(promise.data)
    // console.log(Object.keys(promise).includes("data"))

    let service_data

    if (promise.status &&
        promise.status == 200 &&
        promise.data.status == 200) {

        service_data = [
            ...promise.data.return
        ]
    } else service_data = [
        {
            name: "No Disponible",
            UUID: '',
            activated: true
        }
    ]

    console.log(service_data)

    res.render("dashboard", {
        title: title,
        services: [
            ...service_data
        ],
        user_data: {
            basics: {
                name: '',
                id: ''
            }
        }
    })
})

app.get("/auth", Logged, function (req, res) {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    res.render("auth", {
        title: title
    })
})

app.get("/rem", function (req, res) {
    res.clearCookie("refeshToken", {
        signed: true,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    })

    res.redirect("/")
})

app.get("/test", function (req, res) {
    res.render("test")
})

const { database } = require("../db/create.db.js")
app.get("/cdb", async function (req, res) {
    await database.create_empty_services_collection(req, res)
    await database.create_empty_configured_services_collection(req, res)
    await database.create_empty_service_settings_collection(req, res)

    res.json("empty created!")
})

const { service_model } = require("../models/mongo/services.model.js")
app.get("/cdb-basic", async function (req, res) {
    await service_model.add_service(req, res)
    res.json("basic created!")
})

/*
app.post("/crypt", async function (req, res) {
    try {
        const token = jwt.sign(
            { ...req.body },
            JWT_SECRET_KEY,
            { expiresIn: "5m" }
        )

        res.cookie("token", token, {
            signed: true,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 5 * 60 * 1000
        })

    } catch (err) {
        return res.status(400).json({
            response: {
                status: 400,
                error: "❌ Error encrypting token!"
            }
        })
    }

    res.status(200).json({
        response: {
            status: 200
        }
    })
})

app.post("/del-crypt", function (req, res) {
    const token = req.cookies.token

    let decrypt_token

    if (!token) {
        return res.status(400).json({
            response: {
                status: 400,
                error: "❌ The token doesn't exist!"
            }
        })
    }

    try {
        res.clearCookie("token", {
            signed: true,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/"
        })
    } catch (err) {
        return res.status(400).json({
            response: {
                status: 400,
                error: "❌ Error decrypting token!"
            }
        })
    }

    res.status(200).json({
        response: {
            status: 200
        }
    })
})
*/

module.exports = {
    main_router: app
}