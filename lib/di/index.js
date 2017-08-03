const { createContainer, asValue } = require('awilix')
const request = require('superagent')
const srv = require('../util/srv-resolver')

class DI {
    constructor(core) {
        this.container = createContainer()
        this.container.register({
            logger: asValue(core.logger),
            request: asValue(request),
            srv: asValue(srv),
            restifier: asValue(core.restifier || {}),
            errors: asValue(core.errors)
        })
    }

    registerValue(payload) {
        //TODO: Check its a valid object
        this.container.registerValue(payload)
    }

    resolve(name) {
        return this.container.resolve(name)
    }

}


module.exports = DI