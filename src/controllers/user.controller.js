const jwt = require("jsonwebtoken")

const { user_model } = require("../models/mongo/users.model.js")

const { } = require("../utils/env.utils.js")
const { response } = require("express")

class user_controller {
    static async user_auth(req, res) {
        try {
            const { agent_id, access_key } = req.query

            const data = {
                agent_id: agent_id,
                access_key: access_key
            }

            const response = await user_model.auth_user(data, {})

            //console.log(response)

            try {
                if (response.status == 200) res.cookie(
                    "refeshToken",
                    jwt.sign(
                        {
                            agent_id: data.agent_id,
                            access_key: data.access_key
                        },
                        JWT_SECRET_KEY,
                        { expiresIn: 60 * 60 * 24 * 30 }
                    ),
                    {
                        signed: true,
                        httpOnly: true,
                        secure: true,
                        sameSite: "strict",
                        maxAge: 1000 * 60 * 60 * 24 * 30
                    }
                )
            } catch (sub_err_1) {
                throw new Error("❌ Cookies Problem")
            }

            return res.status(200).json({ status: response.status, message: response.msg })

        } catch (err) {
            return res.status(200).json({
                status: 204,
                msg: "No Content..."
            })
        }
    }

    static async add_user(req, res) {
        await user_model.add_user(req, res)
        return res.status(200).json({ response: "User Added" })
    }

    static async get_info(req, res) {
        try {
            const refeshToken = req.signedCookies.refeshToken
            if (!refeshToken) throw new Error("No Refesh Token")

            const decode = jwt.verify(refeshToken, JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    throw new Error("Invalid Refesh Token")
                }
                return decoded
            })

            const resp = await user_model.find_user({ agent_id: decode.agent_id, access_key: decode.access_key }, {})
            if (!resp) throw new Error("User Not Found")
            if (resp.status == 204) throw new Error("User Not Found")

            return res.status(200).json({
                status: 200,
                msg: 'all its ok',
                name: resp.name,
                id: decode.agent_id,
                uuid: resp.UUID
            })
        } catch (err) { }

        return res.status(200).json({
            status: 204,
            msg: "No Content..."
        })
    }
}

module.exports = {
    user_controller
}