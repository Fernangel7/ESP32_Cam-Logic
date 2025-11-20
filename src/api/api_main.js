const express = require('express')

const app = express.Router()

app.get('/status', (req, res) => {
  res.status(200).json({ status: 'API is running' })
})

app.get('/nn_models', (req, res) => {
  res.status(200).json({ status: 'NN Models are operational' })
})

app.use('/nn_models/facial_recognition', require('./endpoints/facial_recognition.js').facial_recognition_router)



module.exports = {
    api_main_router: app
}