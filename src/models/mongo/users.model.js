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
                name: 'Angel',
                mail: 'angel@securityservice.com',
                age: 20,
                activated: true,
                register_date: new Date(),
                agent_id: 'Fernangel7',
                access_key: '1234567890'
            }

            const result = await users.insertOne(new_user)

            console.log('✅ Usuario insertado correctamente');
            console.log('🆔 ID del documento:', result.insertedId);
            return ({ response: '✅ User added to the Database successfully' })
        } catch (err) {
            return ({ response: "❌ Error on add an user on the Database" })
        }
    }

    static async find_user(req, res) {
        try {
            const db = await getMongoDataBase()
            if (!db) throw new Error("No Database")

            const users = db.collection('users')

            const { agent_id, access_key } = req

            const filter = {
                agent_id: agent_id,
                access_key: access_key
            }

            const result = await users.find(filter).project({ _id: 0, UUID: 1, name: 1}).toArray()

            if (!result) throw new Error('User Not Found')

            return {
                status: 200,
                msg: "all its ok",
                UUID: result[0].UUID,
                name: result[0].name
            }
        } catch (err) { }

        return {
            status: 204,
            msg: 'No Content...'
        }
    }
}

module.exports = {
    user_model: {
        auth_user: user_model.auth_user,
        add_user: user_model.add_user,
        find_user: user_model.find_user
    }
}