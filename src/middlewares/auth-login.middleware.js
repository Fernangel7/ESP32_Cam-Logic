const jwt = require('jsonwebtoken')
const { JWT_SECRET_KEY } = require('../utils/env.utils.js')

function Unlogged(req, res, next) {
    const token = req.cookies.refeshToken

    if (!token) {
        res.redirect('/auth')
    } else {
        try {
            if (!jwt.verify(token, JWT_SECRET_KEY)) {
                res.redirect('/')
            } else next()
        } catch (e) {
            res.clearCookie('refeshToken', {
                sign: true,
                httpOnly: true,
                secure: true,
                sameSite: 'Strict'
            })

            res.redirect('/')
        }
    }
}

function Logged(req, res, next) {
    const token = req.cookies.refeshToken

    if (token) {
        try {
            if (jwt.verify(token, JWT_SECRET_KEY)) {
                res.redirect('/dashboard')
            } else next()
        } catch (e) {
            res.clearCookie('refeshToken', {
                sign: true,
                httpOnly: true,
                secure: true,
                sameSite: 'Strict'
            })
            next()
        }
    } else next()
}

module.exports = {
    Logged,
    Unlogged
}