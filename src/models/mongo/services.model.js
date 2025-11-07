const crypto = require('node:crypto')

const { getMongoDataBase } = require("../../db/mongo.db.js")

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

            console.log(result)

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
            return { status: 204, error: "❌ Error on find a services on the Database", data: {}}
        }
    }
}

module.exports = {
    service_model
}