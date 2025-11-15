class api_controller {
    static async facial_recognition_service(req, res) {
        return res.status(200).json({
            status: 200,
            msg: "Facial Recognition Service Endpoint Reached"
        })
    }
}

module.exports = {
    api_controller
}