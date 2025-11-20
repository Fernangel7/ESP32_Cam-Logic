const env = process.env;

module.exports = {
    PORT: env.PORT,
    MONGODB_URI: env.MONGODB_URI,
    MONGO_DATABASE_NAME: env.MONGO_DATABASE_NAME,
    JWT_SECRET_KEY: env.JWT_SECRET_KEY,
    COOKIE_SECRET_KEY: env.COOKIE_SECRET_KEY,
    SECURED: env.SECURED === 'true',
    DEV: env.DEV === 'true'
};