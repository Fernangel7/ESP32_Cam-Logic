require("dotenv").config()

const { MongoClient, ServerApiVersion } = require('mongodb');

const { MONGODB_URI, MONGO_DATABASE_NAME } = require("../utils/env.utils.js");

const client = new MongoClient(MONGODB_URI, {
    ssl: true,
    tlsAllowInvalidCertificates: false,
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let db

const connectMongo = async () => {
    await client.connect(MONGODB_URI).then(function () {
        console.log("✅ Connected to Mongo Atlas...")
    }).catch(function () {
        console.log("❌ Connection error on Mongo Atlas...")
        client.close()
    })

    try {
        db = client.db(MONGO_DATABASE_NAME)
        await db.command({ ping: 1 })
        console.log("✅ Connected to database on Mongo Atlas...")
    } catch (err) {
        console.log("❌ Connection error on database of Mongo Atlas...")
        client.close()
    }
}

const getMongoDataBase = async () => {
    try {
        if (!db) throw new Error("❌ No Database Identified...")
        return db
    } catch (err) {
        //console.log(err)
    }
}

module.exports = {
    connectMongo,
    getMongoDataBase
}