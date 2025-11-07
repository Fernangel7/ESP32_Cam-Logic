const { getMongoDataBase } = require("./mongo.db.js")
class database {
    static async create_empty_users_collection(req, res) {
        try {
            const db = await getMongoDataBase()

            if ((await db.listCollections({ name: 'users' }).toArray()).length > 0) {
                await db.collection('users').drop();
            }

            await db.createCollection('users', {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['name', 'mail', 'age'],
                        properties: {
                            UUID: {
                                bsonType: 'string',
                                description: 'Universal Unique Identificator'
                            },
                            name: {
                                bsonType: 'string',
                                description: 'El nombre del usuario debe ser un texto y es obligatorio'
                            },
                            mail: {
                                bsonType: 'string',
                                pattern: '^.+@.+\\..+$',
                                description: 'Debe ser un correo válido y es obligatorio'
                            },
                            age: {
                                bsonType: 'int',
                                minimum: 0,
                                maximum: 120,
                                description: 'La edad debe ser un número entero entre 0 y 120'
                            },
                            activated: {
                                bsonType: 'bool',
                                description: 'Indica si el usuario está activo o no (opcional)'
                            },
                            register_date: {
                                bsonType: 'date',
                                description: 'Fecha en que se registró el usuario (opcional)'
                            },
                            agent_id: {
                                bsonType: 'string',
                                description: 'N/A'
                            },
                            access_key: {
                                bsonType: 'string',
                                description: 'N/A'
                            }
                        }
                    }
                }
            })

            const users = db.collection('users');

            await users.createIndex({ UUID: 1 }, { unique: true, name: 'idx_uuid_unique' });
            await users.createIndex({ name: 1 }, { name: 'idx_name' });
            await users.createIndex({ mail: 1 }, { unique: true, name: 'idx_mail_unique' });
            await users.createIndex({ age: 1 }, { name: 'idx_age' });
            await users.createIndex({ activated: 1 }, { name: 'idx_activated' });
            await users.createIndex({ register_date: -1 }, { name: 'idx_register_date_desc' });
            await users.createIndex({ agent_id: 1 }, { name: 'idx_agent' });
            await users.createIndex({ access_key: 1 }, { unique: true, sparse: true, name: 'idx_access_key_unique' });

            // let responses = [
            //     { status: 200, response: "✅ Database created successfully" }
            // ]

            // responses.push(await this.add_user(req, res))

            // res.json(responses)
            return { status: 200, response: "✅ Database created successfully" }
        } catch (err) {
            // console.log(err)
            return { status: 400, response: "❌ Error on create Database" }
        }
    }

    static async create_empty_services_collection(req, res) {
        try {
            const db = await getMongoDataBase()

            if ((await db.listCollections({ name: 'services' }).toArray()).length > 0) {
                await db.collection('services').drop();
            }

            await db.createCollection('services', {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: [],
                        properties: {
                            UUID: {
                                bsonType: 'string',
                                description: 'Universal Unique Identificator'
                            },
                            name: {
                                bsonType: 'string',
                                description: 'El nombre del servicio debe ser un texto'
                            },
                            description: {
                                bsonType: 'string',
                                description: 'Descripcion'
                            },
                            type: {
                                bsonType: 'string',
                                description: 'external api / local api'
                            },
                            activated: {
                                bsonType: 'bool',
                                description: 'Indica si el usuario está activo o no (opcional)'
                            },
                            register_date: {
                                bsonType: 'date',
                                description: 'Fecha en que se registró el usuario (opcional)'
                            }
                        }
                    }
                }
            })

            const services = db.collection('services')

            await services.createIndex({ UUID: 1 }, { unique: true });
            await services.createIndex({ name: 1 });
            await services.createIndex({ description: 1 });
            await services.createIndex({ type: 1});
            await services.createIndex({ activated: 1 });
            await services.createIndex({ register_date: -1 });

            return { status: 200, response: "✅ Database created successfully" }
        } catch (err) {
            return { status: 400, response: "❌ Error on create Database" }
        }
    }

    static async create_empty_configured_services_collection(req, res) {
        try {
            const db = await getMongoDataBase()

            if ((await db.listCollections({ name: 'configured_services' }).toArray()).length > 0) {
                await db.collection('configured_services').drop();
            }

            await db.createCollection('configured_services', {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: [],
                        properties: {
                            UUID: {
                                bsonType: 'string',
                                description: 'Universal Unique Identificator'
                            },
                            UUID_service: {
                                bsonType: 'string',
                                description: 'Universal Unique Service Identificator'
                            },
                            name: {
                                bsonType: 'string',
                                description: 'El nombre del usuario debe ser un texto y es obligatorio'
                            },
                            UUID_config: {
                                bsonType: 'string',
                                description: 'external api / local api'
                            },
                            activated: {
                                bsonType: 'bool',
                                description: 'Indica si el usuario está activo o no (opcional)'
                            },
                            register_date: {
                                bsonType: 'date',
                                description: 'Fecha en que se registró el usuario (opcional)'
                            }
                        }
                    }
                }
            })

            const configured_service = db.collection('configured_services')

            await configured_service.createIndex({ UUID: 1 }, { unique: true });
            await configured_service.createIndex({ UUID_service: 1 });
            await configured_service.createIndex({ name: 1 });
            await configured_service.createIndex({ UUID_config: 1 });
            await configured_service.createIndex({ activated: 1 });
            await configured_service.createIndex({ register_date: -1 });


            return { status: 200, response: "✅ Database created successfully" }
        } catch (err) {
            return { status: 400, response: "❌ Error on create Database" }
        }
    }

    static async create_empty_service_settings_collection(req, res) {
        try {
            const db = await getMongoDataBase()

            if ((await db.listCollections({ name: 'service_settings' }).toArray()).length > 0) {
                await db.collection('service_settings').drop();
            }

            await db.createCollection('service_settings', {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: [],
                        properties: {
                            UUID: {
                                bsonType: 'string',
                                description: 'Universal Unique Identificator'
                            },
                            UUID_service: {
                                bsonType: 'string',
                                description: 'Universal Unique Service Identificator'
                            },
                            config: {
                                bsonType: 'object',
                                description: 'El nombre del usuario debe ser un texto y es obligatorio'
                            },
                            activated: {
                                bsonType: 'bool',
                                description: 'Indica si el usuario está activo o no (opcional)'
                            },
                            register_date: {
                                bsonType: 'date',
                                description: 'Fecha en que se registró el usuario (opcional)'
                            }
                        }
                    }
                }
            })

            const service_settings = db.collection('service_settings')

            await service_settings.createIndex({ UUID: 1 }, { unique: true });
            await service_settings.createIndex({ UUID_service: 1 });
            await service_settings.createIndex({ config: 1 });
            await service_settings.createIndex({ activated: 1 });
            await service_settings.createIndex({ register_date: -1 });


            return { status: 200, response: "✅ Database created successfully" }
        } catch (err) {
            return { status: 400, response: "❌ Error on create Database" }
        }
    }

    // static async create_empty_any_collection() {
    //     try {
    //         const db = await getMongoDataBase()

    //         if ((await db.listCollections({ name: 'any' }).toArray()).length > 0) {
    //             await db.collection('any').drop();
    //         }

    //         return { status: 200, response: "✅ Database created successfully" }
    //     } catch (err) {
    //         return { status: 400, response: "❌ Error on create Database" }
    //     }
    // }
}

module.exports = {
    database
}