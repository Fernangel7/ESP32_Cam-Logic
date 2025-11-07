const { service_model } = require("../models/mongo/services.model.js")

class service_controller {
    static async get_all_services(req, res) {
        try {
            const response = await service_model.get_all_services({}, {})

            if (!response.status == 200) throw new Error("")

            return res.status(200).json({ status: response.status, message: response.error, return: response.data })

        } catch (err) {
            return res.status(200).json({
                status: 204,
                msg: "No Content..."
            })
        }
    }
}

module.exports = {
    service_controller
}