const express = require('express')
const axios = require("axios")

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

    const [promise, data_user] = await Promise.all([
        axios.get(`${req.protocol}://${req.get("host")}/service/get-services`, {
            timeout: 15000
        }).catch((err) => {
            return {
                status: 200,
                data: {
                    status: 204,
                    msg: "no data"
                }
            }
        }),
        axios.get(`${req.protocol}://${req.get("host")}/user/get-info`, {
            headers: {
                'Cookie': req.headers['cookie']
            },
            timeout: 15000,
        }).catch((err) => {
            return {
                status: 200,
                data: {
                    status: 204,
                    msg: "no data"
                }
            }
        })
    ])

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

    let iduser, nameuser

    if (data_user.status &&
        data_user.status == 200 &&
        data_user.data.status == 200) {
        nameuser = data_user.data.name
        iduser = data_user.data.id
    } else {
        nameuser = 'Unknown'
        iduser = 'Unknown'
    }

    const get_configured_services = await axios.get(`${req.protocol}://${req.get("host")}/service/get-configured-services`, {
        params: {
            userUUID: data_user.data.uuid
        },
        timeout: 15000,
    }).catch((err) => {
        return {
            status: 200,
            data: {
                status: 204,
                msg: "no data"
            }
        }
    })

    let s_configured

    if (get_configured_services.status &&
        get_configured_services.status == 200 &&
        get_configured_services.data.status == 200) {
        // console.log(get_configured_services.data)
        s_configured = { ...get_configured_services.data }
    } else {
        s_configured = {}
    }

    const s_configured_filter = {
        status: s_configured.status,
        services: s_configured.services.map(service => {
            const { userUUID, register_date, ...resto } = service;

            return resto;
        })
    };

    res.render("dashboard", {
        title: title,
        services: [
            ...service_data
        ],
        user_data: {
            basics: {
                name: nameuser,
                id: iduser
            },
            services: s_configured_filter
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

app.get("/logout", function (req, res) {
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
    await require('../models/mongo/users.model.js').user_model.add_user()
    res.json("basic created!")
})

module.exports = {
    main_router: app
}