const express = require('express')

const { title } = require("../utils/data.utils.js")

const { Logged, Unlogged } = require('../middlewares/auth-login.middleware.js')

const app = express.Router()

app.get("/", function (req, res) {
    res.redirect("/dashboard")
})

app.get("/dashboard", Unlogged, function (req, res) {
    res.render("dashboard", {
        title: title
    })
})

app.get("/auth", Logged, function (req, res) {
    res.render("auth", {
        title: title
    })
})

module.exports = {
    main_router: app
}