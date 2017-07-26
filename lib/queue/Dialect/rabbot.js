class Rabbot {

    constructor(queue) {
        this.queue = queue
        this.connected = false
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

        this.configuration = {
            connection: {
                uri: this.queue.connectionUrl
            },
            exchanges: [],
            queues: [],
            binding: [],
        }
    }

    registerExchange(exchanges) {
        // if exchanges is not a array, make it an array
        if (!Array.isArray(exchanges)) {
            exchanges = [exchanges]
        }
        //TODO: Add validation of the incoming array
        this.configuration.exchanges = exchanges

    }

    registerQueue(queue) {
        // TODO: Fill later based on user
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.rabbot.configure(this.configuration).then(resolve).catch(reject)
        })
    }

    publish(exchange, routingKey, message) {
        this.rabbot.publish(exchange, { routingKey: routingKey, body: message })
    }

    subscribe() {

    }

    disconnect() {
        this.rabbot.shutdown()
    }

}

module.exports = Rabbot