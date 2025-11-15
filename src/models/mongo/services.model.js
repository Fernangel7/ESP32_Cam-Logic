const crypto = require('node:crypto')

const { getMongoDataBase } = require("../../db/mongo.db.js")
const { type } = require('node:os')
const { access } = require('node:fs')

class service_model {
    static async add_service(req, res) {
        try {
            const db = await getMongoDataBase()
            if (!db) throw new Error("❌ No Database")

            const services = db.collection('services')

            const new_service = {
                UUID: crypto.randomUUID(),
                name: 'Facial Recognition',
                description: 'Unlock with facial recognition using a ESP32 Cam - local ai model api',
                type: 'local api',
                activated: true,
                register_date: new Date()
            }

            const result = await services.insertOne(new_service)

            // console.log(result)

            console.log('✅ service insertado correctamente');
            console.log('🆔 ID del documento:', result.insertedId);
            return ({ response: '✅ service added to the Database successfully' })
        } catch (err) {
            return ({ response: "❌ Error on add an service on the Database" })
        }
    }

    static async get_all_services(req, res) {
        try {
            const db = await getMongoDataBase()
            if (!db) throw new Error("❌ No Database")

            const services = db.collection('services')

            const result = await services.find(
                { activated: true },
                {
                    projection: {
                        _id: 0,
                        UUID: 1,
                        name: 1,
                        activated: 1
                    }
                }
            ).toArray()

            if (result.length > 0) {
                //console.log({ status: 200, error: "", data: [...result] })
                //console.log('✅ services consultados correctamente');
                return { status: 200, error: "", data: [...result] }
            } else throw new Error("")

        } catch (err) {
            return { status: 204, error: "❌ Error on find a services on the Database", data: {} }
        }
    }

    static async find_service(req, res) {
        try {
            const db = await getMongoDataBase()
            if (!db) throw new Error("❌ No Database")

            const services = db.collection('services')

            const response = await services.findOne({ activated: true, UUID: req.UUID }, { projection: { _id: 0 } })

            if (!response) throw new Error("❌ Service Not Found")

            const configured_services = db.collection('configured_services')

            const new_service_config = {
                UUID: crypto.randomUUID(),
                userUUID: req.userUUID,
                name: response.name,
                n_rep: crypto.randomInt(10000000, 99999999),
                config_data: {
                    activated: true,
                    endpoint_url: `https://[host]/api/nn_models/facial_recognition/v1/:${crypto.randomUUID()}`,
                    method: 'POST',
                    access_key: crypto.randomBytes(16).toString('hex'),
                    access_password: crypto.randomBytes(16).toString('hex')
                },
                activated: true,
                register_date: new Date()
            }

            await configured_services.insertOne(new_service_config)

            const dt = new_service_config.config_data

            return {
                status: 200,
                error: "all its ok.",
                config_data: {
                    activated: dt.activated,
                    EndPoint: dt.endpoint_url,
                    access_key: dt.access_key,
                    access_password: dt.access_password,
                    method: dt.method
                },
                input: {},
                output: {},
                example_input: `
input: {
    server: {
        nn_api: {
            endpoint: {
                activated: true,
                url: 'https://[hostname]/api/nn_models/facial_recognition/v1/:UUID',
                method: 'POST',
                access_key: 'user_key1234',
                access_password: 'password1234',
                data: {
                    objective: 'image_base64',
                    image_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'
                }
            }
        },
        data_objectives: {
            mutiple_person: {
                activated: true, //false = only one person recognized | true = multiple persons recognized
                objectives: [ //only for mutiple_person = true
                    {
                        name: 'Unknown', //recognized person name
                        role: 'Owner', //recognized person role
                        personalized_message: 'Access Granted!', //personalized message for the recognized person
                        icon: { //icon for the recognized person
                            activated: true, //activate icon
                            type: 'success', //type: success | error
                            binary_icon_schema: true //true = binary icon schema | false = url icon schema
                        },
                        valid: true //true = access granted | false = access denied
                    },
                    {
                        name: 'Unknown', //recognized person name
                        role: 'Accountant', //recognized person role
                        personalized_message: 'Access Denied!', //personalized message for the recognized person
                        icon: { //icon for the recognized person
                            activated: true, // activate icon
                            type: 'error', //type: success | error
                            binary_icon_schema: true //true = binary icon schema | false = url icon schema
                        },
                        valid: false //true = access granted | false = access denied
                    }
                ],
                target: { //only for mutiple_person = false
                    name: 'Unknown', //recognized person name
                    role: 'Visitor', //recognized person role
                    personalized_message: 'Access Granted!', //personalized message for the recognized person
                    icon: { //icon for the recognized person
                        activated: true, //type: success | error
                        type: 'success', //icon type
                        binary_icon_schema: true //true = binary icon schema | false = url icon schema
                    },
                    valid: false //true = access granted | false = access denied
                },
                save: { //save recognized persons data
                    access_granted: true, //save access granted persons
                    access_denied: true //save access denied persons
                }
            }
        }
    }
}
                    `,
                example_output: `
output: {
    status: 0, //possible status: 0 thru 255
        response: 'NN Service Configured', //possible responses: NN Service Configured | Access Granted | Access Denied | No Face Detected | Multiple Faces Detected
            data: {
        recognized_persons: [ //array of recognized persons
            {
                any: true, //true = any person recognized | false = specific person recognized
                name: 'Unknown', //recognized person name
                role: 'Owner', //recognized person role
                personalized_message: 'Welcome back, John!', //personalized message for the recognized person
                icon: { //icon for the recognized person
                    activated: true, //activate icon
                    type: 'success', //type: success | error
                    binary_icon_schema: true, //true = binary icon schema | false = url icon schema
                },
                valid: true //true = access granted | false = access denied
            }
        ],
            target_image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...', //base64 schema of the target image
                processed_image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...' //base64 schema of the processed image
    }
}
                `
            }
        } catch (err) { }

        return { status: 204, error: "❌ Error on find a service on the Database", data: {} }
    }

    static async get_configured_services(req, res) {
        try {
            const db = await getMongoDataBase()
            if (!db) throw new Error("❌ No Database")

            const conf_services = db.collection('configured_services')

            const response = await conf_services.find({ activated: true, userUUID: req.userUUID }).project({ _id: 0 }).toArray()

            // console.log(response)

            if (!response) throw new Error("❌ Service Not Found")

            // console.log({
            //     useruuid: req.userUUID,
            //     status: 200,
            //     services: [ ...response ]
            // })

            return {
                status: 200,
                services: [ ...response ]
            }
        } catch (err) { }

        return { status: 204, error: "❌ Error on find a service on the Database", data: {} }
    }
}

module.exports = {
    service_model
}