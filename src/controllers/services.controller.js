const jwt = require("jsonwebtoken")

const { JWT_SECRET_KEY } = require("../utils/env.utils.js")

const { service_model } = require("../models/mongo/services.model.js")
const { user_model } = require("../models/mongo/users.model.js")

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

    static async get_service_configurations(req, res) {
        try {
            if (!req.body) throw new Error("Invalid Body")
            if (!req.body.UUID || !req.body.name) throw new Error("Invalid Data")

            const { UUID, name } = req.body

            const refeshToken = req.signedCookies.refeshToken
            if (!refeshToken) throw new Error("No Refesh Token")

            const decode = jwt.verify(refeshToken, JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    throw new Error("Invalid Refesh Token")
                }
                return decoded
            })

            // console.log(decode)

            const resp = await user_model.find_user({ agent_id: decode.agent_id, access_key: decode.access_key }, {})
            if (!resp) throw new Error("User Not Found")
            if (resp.status == 204) throw new Error("User Not Found")

            const userUUID = resp.UUID

            //verify service exists
            const service_exists = await service_model.find_service({ UUID: UUID, userUUID: userUUID }, {})
            if (!service_exists) throw new Error("Service Not Found")
            if (service_exists.status == 204) throw new Error("Service Not Found")
            if (!service_exists.config_data) throw new Error("Service Configurations Not Found")

            //get service configurations
            // const service_configurations = await service_model.get_service_configurations({ UUID: UUID, name: name }, {})
            // if (service_configurations)

            // console.log(service_exists)

            return res.status(200).json({ ...service_exists })
        } catch (err) { }

        return res.status(200).json({
            status: 204,
            msg: "No Content..."
        })
    }

    static async get_configured_services(req, res) {
        try {
            const { userUUID } = req.query
            const response = await service_model.get_configured_services({ userUUID: userUUID }, {})

            if (!response) throw new Error('Service not Found')
            if (response.status != 200) throw new Error('Error on get configured services')

            return res.status(200).json({ ...response })
            
        } catch (err) { }

        return res.status(200).json({
            status: 204,
            msg: "No Content..."
        })
    }
}

module.exports = {
    service_controller
}