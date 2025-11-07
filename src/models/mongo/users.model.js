const crypto = require('node:crypto')

const { getMongoDataBase } = require("../../db/mongo.db.js")

class user_model {

    static async auth_user(req, res) {
        try {
            const db = await getMongoDataBase()
            const collection = db.collection("users")

            const { agent_id, access_key } = req

            const filter = {
                agent_id: agent_id,
                access_key: access_key
            }

            const result = await collection.find(filter).toArray()

            // const asd = await collection.find({}).toArray()
            // const asd = await collection.findOne({})

            if (result.length == 1) {
                return {
                    status: 200,
                    msg: "correct authentication..."
                }
            } else {
                return {
                    status: 401,
                    msg: "incorrect authentication..."
                }
            }

            // const response = await db.collection("users").insertOne()

        } catch (err) {
            return {
                status: 204,
                msg: "No Content..."
            }
        }
    }

    static async add_user(req, res) {
        try {
            const db = await getMongoDataBase()
            if (!db) throw new Error("❌ No Database")

            const users = db.collection('users')

            const new_user = {
                UUID: crypto.randomUUID(),
                name: 'Donnovan Joel Creano Rodriguez',
                mail: 'djoel_crofriguez@securityservice.com',
                age: 19,
                activated: true,
                register_date: new Date(),
                agent_id: 'Donnovan_Agent',
                access_key: 'dAgent_#4193@dotcom'
            }

            const result = await users.insertOne(new_user)

            console.log('✅ Usuario insertado correctamente');
            console.log('🆔 ID del documento:', result.insertedId);
            return ({ response: '✅ User added to the Database successfully' })
        } catch (err) {
            return ({ response: "❌ Error on add an user on the Database" })
        }
    }
}

module.exports = {
    user_model: {
        auth_user: user_model.auth_user
    }
}