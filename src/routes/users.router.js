const express = require('express')

const { user_controller } = require('../controllers/user.controller.js')
const { service_controller } = require('../controllers/services.controller.js')

const app = express.Router()

app.get("/auth", async (req, res) => await user_controller.user_auth(req, res))
// app.get("/basic", async (req, res) => await user_controller.add_user(req, res))
app.get('/get-info', async (req, res) => await user_controller.get_info(req, res))

module.exports = {
    user_router: app
}