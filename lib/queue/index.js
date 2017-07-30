class Rabbot {

    constructor(config) {
        this.topology = config
        try {
            this.rabbot = require('rabbot')
        } catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') {
                throw new Error('Please install rabbot package locally. $ yarn add rabbot')
            }
            throw err
        }

        this.rabbot.on('unreachable', () => {
            this.rabbot.retry()
        })


    }

    connect() {
        return this.rabbot.configure(this.topology)
    }

    publish(exchange, routingKey, message) {
        this.rabbot.publish(exchange, {routingKey: routingKey, body: message})
    }

    subscribe() {

    }

    disconnect() {
        this.rabbot.shutdown()
    }

}

module.exports = Rabbot