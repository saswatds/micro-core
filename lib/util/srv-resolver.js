
const dns = require('dns')
const resolver = (hostname) => {
    return new Promise((resolve, reject) => {
        dns.resolveSrv(hostname, (err, address) => {
            if (err) reject(err)
            if (address.length == 0) reject(new Error('service could not be found'))
            resolve(`${address[0].name}:${address[0].port}`)
        })
    })
}

module.exports = resolver