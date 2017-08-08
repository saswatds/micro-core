
const dns = require('dns')
const retry = require('retry')

const resolver = (hostname) => {
    const operation = retry.operation({
        retries: 5,
        factor: 3,
        minTimeout: 10,
        maxTimeout: 100
    })
    return new Promise((resolve, reject) => {
        operation.attempt(() => {
            dns.resolveSrv(hostname, (err, address) => {
                if (operation.retry(err)) {
                    return
                }
                if (err) return reject(new Error(hostname + 'could not be found'))
                resolve(`${address[0].name}:${address[0].port}`)
            })
        })
    })
}

module.exports = resolver