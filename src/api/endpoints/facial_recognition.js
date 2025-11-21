const express = require('express')
const fs = require('node:fs')
const { spawn } = require('node:child_process')
const path = require('node:path')
const crypto = require('node:crypto')
const { match } = require('node:assert')

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
        if (!req.body.data) {
            return res.status(400).json({ error: "No data provided" })
        }

        const data = JSON.parse(req.body.data).input
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
                ...objectives.map(e => {
                    return {
                        name: e.name,
                        role: e.role,
                        personalized_message: e.personalized_message,
                        icon: e.icon,
                        image: e.image,
                        valid: e.valid,
                        uuid: crypto.randomUUID()
                    }
                })
            ],
            save_options: {
                ...pre_objective.save
            }
        }

        const images_routes = {
            objective: [
                {
                    name: `${String(api_config.objective.name).includes(' ') ? String(api_config.objective.name).replace(/ /g, '_') : String(api_config.objective.name)}`,
                    path: path.join(__dirname, '..', '..', 'public', 'temp', `temp_${String(api_config.objective.name).includes(' ') ? String(api_config.objective.name).replace(/ /g, '_') : String(api_config.objective.name)}_${Date.now()}.png`),
                    uuid: crypto.randomUUID()
                }
            ],
            objectives: [
                ...api_config.compare_with.map(obj => {
                    return {
                        name: `${String(obj.name).includes(' ') ? String(obj.name).replace(/ /g, '_') : String(obj.name)}`,
                        path: path.join(__dirname, '..', '..', 'public', 'temp', 'objectives', `temp_${String(obj.name).includes(' ') ? String(obj.name).replace(/ /g, '_') : String(obj.name)}_${Date.now()}.png`),
                        uuid: obj.uuid
                    }
                }),
            ]
        }

        fs.writeFile(images_routes.objective[0].path, Buffer.from(api_config.objective.image_bits.data), (err) => {
            if (err) return
        })

        for (let i = 0; i < images_routes.objectives.length; i++) {
            try {
                fs.writeFile(images_routes.objectives[i].path, Buffer.from(api_config.compare_with[i].image.data), err => {
                    if (err) return
                })
            } catch (e) { console.log(e) }
        }

        // cargar modelo de python
        const py = spawn(path.join(__dirname, '..', '..', 'venv', 'bin', 'python3') /*"./venv/bin/python"*/, [path.join(__dirname, '..', 'models', 'blaze_face.py')])

        const payload = {
            images_data: [
                ...images_routes.objectives
            ],
            target_image: {
                ...images_routes.objective[0]
            }
        }

        py.stdin.write(JSON.stringify(payload));
        py.stdin.end();

        let output = "";
        py.stdout.on("data", (d) => output += d.toString());

        py.on("close", () => {
            const remove_image = async (path) => {
                try {
                    if (fs.existsSync(path)) fs.unlinkSync(path)
                } catch (e) { }
            }
            remove_image(images_routes.objective[0].path)
            for (let i = 0; i < api_config.compare_with.length; i++) {
                remove_image(images_routes.objectives[i].path)
            }

            try {
                const parsed_output = JSON.parse(output)

                const matched_object = api_config.compare_with.filter(e => {
                    return parsed_output.match === e.uuid
                })[0]

                res.status(200).json({
                    status: 200,
                    msg: "Facial Recognition preview processed",
                    data: {
                        match: {
                            name: matched_object.name,
                            message: matched_object.personalized_message,
                            icon: {
                                activated: matched_object.icon.activated,
                                type: matched_object.icon.type
                            },
                            valid: matched_object.valid
                        }
                    }
                })
            } catch (e) {
                console.log("Error al parsear JSON de Python. Salida recibida:", output);
                console.log(e);
                res.status(500).json({ error: "Invalid response from python", raw_output: output });
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Invalid response from python" })
    }
})

module.exports = {
    facial_recognition_router: app
}