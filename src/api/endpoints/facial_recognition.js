const express = require('express')
const { spawn } = require('node:child_process')
const path = require('node:path')

const app = express.Router()

// POST preview endpoint: /api/nn_models/facial_recognition/v1/:UUID/preview
app.post('/:version/:UUID/:status', async (req, res) => {
    // const { UUID } = req.params
    // // Basic stub response; echo body for now
    // return res.status(200).json({
    //     status: 200,
    //     msg: 'Facial Recognition preview processed',
    //     endpoint_uuid: UUID,
    //     input: req.body || null
    // })


    //validar si el endpoint existe

    try {
        const data = req.body.input
        const endpoint = data.server.nn_api.endpoint
        const pre_objective = data.server.data_objectives.mutiple_person
        const objectives = pre_objective.activated ? pre_objective.objectives : pre_objective.target

        const api_config = {
            active: endpoint.activated,
            method: endpoint.method,
            url: endpoint.url,
            access_key: endpoint.access_key,
            access_password: endpoint.access_password,
            objective: {
                name: endpoint.data.objective,
                image_bits: endpoint.data.image_bits
            },
            compare_with: [
                ...objectives
            ],
            save_options: {
                ...pre_objective.save
            }
        }

        // const python = spawn("python3", [path.join(__dirname, '..', 'models', 'blaze_face.py')]);
        // python.stdin.write(JSON.stringify(api_config))
        // python.stdin.end()

        // let output = ''

        // python.stdout.on("data", (data) => output += data.toString())
        // python.on('close', () => {
        //     try {
        //         const result = JSON.parse(output);
        //         return res.json(result);
        //     } catch (err) {
        //         return res.status(500).json({ error: "Invalid response from python" });
        //     }
        // })

        const py = spawn(path.join(__dirname, '..', '..', 'venv', 'bin', 'python') /*"./venv/bin/python"*/, [path.join(__dirname, '..', 'models', 'blaze_face.py')])

        const payload = {
            drive_paths: [
                api_config.compare_with.map(obj => obj.image)
            ],
            target_image: path.join(__dirname, '..', '..', 'public', 'images', 'ktdi.jpeg')
        }

        py.stdin.write(JSON.stringify(payload));
        py.stdin.end();

        let output = "";
        py.stdout.on("data", (d) => output += d.toString());

        py.on("close", () => {
            try {
                res.json(JSON.parse(output));
            } catch {
                res.status(500).json({ error: "Invalid response from python" });
            }
        });

    } catch (error) {
        res.status(500).json({ error: "Invalid response from python" })
    }
})

module.exports = {
    facial_recognition_router: app
}