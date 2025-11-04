const express = require('express')

const { user_controller } = require('../controllers/user.controller.js')

const app = express.Router()

app.get("/auth", async (req, res) => await user_controller.user_auth(req, res))

module.exports = {
    user_router: app
}