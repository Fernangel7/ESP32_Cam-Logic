const jwt = require('jsonwebtoken')
const { JWT_SECRET_KEY, SECURED } = require('../utils/env.utils.js')

function Unlogged(req, res, next) { //No logged
    const token = req.signedCookies.refeshToken

    if (!token) {
        res.redirect('/auth')
    } else {
        try {
            if (!jwt.verify(token, JWT_SECRET_KEY)) {
                res.redirect('/auth')
            } else next()
        } catch (e) {
            res.clearCookie('refeshToken', {
                signed: true,
                httpOnly: true,
                secure: SECURED,
                sameSite: 'Strict'
            })

            res.redirect('/auth')
        }
    }
}

function Logged(req, res, next) { //Logged verify
    const token = req.signedCookies.refeshToken

    if (token) {
        try {
            if (!jwt.verify(token, JWT_SECRET_KEY)) {
                res.redirect('/auth')
            } else {
                const previousURL = req.get('Referer'); // obtiene la URL anterior
                // console.log(previousURL)
                if (previousURL) {
                    res.redirect(previousURL);
                } else {
                    res.redirect('/'); // fallback por si no existe Referer
                }
            }
        } catch (e) {
            res.clearCookie('refeshToken', {
                signed: true,
                httpOnly: true,
                secure: SECURED,
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