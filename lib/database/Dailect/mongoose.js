class MongooseORM {

    constructor(database) {
        this.database = database
        this.isClosed = false
        try {
            this.mongoose = require('mongoose')
        } catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') {
                throw new Error('Please install mongoose package locally. $ yarn add mongoose')
            }
            throw err
        }
        if (!this.database.connectionString) {
            throw new Error('ConnectionString has not been set. Probably context has not been set properly')
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.connection = this.mongoose.createConnection(this.database.connectionString, {useMongoClient: true})

            const errorHandler = e => {
                console.log(e)
                this.connection.removeListener('open', openHandler)
                this.connection.removeListener('error', errorHandler)
                reject(e)
            }

            const openHandler = () => {
                this.isClosed = false
                this.connection.removeListener('error', errorHandler)
                resolve(this.connection)
            }

            this.connection.on('error', errorHandler)
            this.connection.once('open', openHandler)

        })
    }

    disconnect() {
        if (this.isClosed) {
            return
        }
        this.connection.close()
        this.isClosed = true
    }

    generateModel(name, schema, hook) {
        // TODO: Check if its mongoose schema
        const _schema = new this.mongoose.Schema(schema)
        if (hook) hook.call(this, _schema)
        return this.mongoose.model(name, _schema)
    }
}

module.exports = MongooseORM