class PedalCore {
    constructor(config) {
        const defaultConfig = {
            serviceName: 'core-service',
            port: 3000,
            database: 'mongodb',
            queueEnabled: true
        }
        this._config = Object.assign(defaultConfig, config)
    }

    registerApi () {

    }

    registerRepo () {

    }

    registerService () {

    }

    registerModel () {

    }

    start(port) {
        if (port) this._config.port = port
        // Start the callback sequence
    }
}

module.exports = PedalCore