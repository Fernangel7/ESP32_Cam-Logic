const express = require('express')

const { service_controller } = require('../controllers/services.controller.js')

const app = express.Router()

app.get("/get-services", async (req, res) => await service_controller.get_all_services(req, res))
app.post('/configurations/get', async (req, res) => await service_controller.get_service_configurations(req, res))
app.get('/get-configured-services', async (req, res) => await service_controller.get_configured_services(req, res))

module.exports = {
    service_router: app
}