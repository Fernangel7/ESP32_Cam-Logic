const express = require('express')

const { api_controller } = require('../controllers/api.controller.js')

const app = express.Router()

app.get('/nn_models/facial_recognition/v1/:UUID', async (req, res) => await api_controller.facial_recognition_service(req, res))

module.exports = {
    api_router: app
}