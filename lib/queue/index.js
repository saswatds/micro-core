class Queue {
    constructor (dialectName, connectionUrl) {
        this.connectionUrl = connectionUrl

        let QUEUE
        switch (QUEUE) {
            case 'rabbot':
                QUEUE = require('./Dialect/rabbot')
                break
            default:
                throw new Error(`The ${dialectName} is not yet supported. Make a request in the slack 'api' channel for addition`)
        }
        this.q = new QUEUE(this)
    }

    connect () {
        return this.q.connect()
    }

    publish (data) {
        return this.q.publish(data)
    }

    subscribe (channel) {
        return this.q.subscribe(channel)
    }

    disconnect () {
        return this.q.disconnect()
    }
}

module.exports = Queue
