const { DEV, PORT } = require('../utils/env.utils.js')

const cors = require('cors')
const os = require('node:os')

let local_ipv4

if (DEV) {
  local_ipv4 = getLocalIP()
}

function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        local_ipv4 = iface.address
      }
    }
  }
  local_ipv4 = `http://localhost:${PORT}`
}

const ACCEPTED_ORIGINS = [
  DEV ? 'http://localhost:5000' : local_ipv4
]

const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {
    if (acceptedOrigins.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
})

module.exports = {
  corsMiddleware
}