const {createContainer, asValue} = require('awilix')
const unirest = require('unirest')

class DI {
    constructor(core) {
        this.container = createContainer()
        this.container.register({
            logger: asValue(core.logger),
            unirest: asValue(unirest)
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