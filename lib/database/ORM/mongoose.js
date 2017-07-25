class MongooseORM {

    constructor(database) {
        this.database = database
        this.isClosed = false
        try {
            this.mongoose = require('mongoose')
        } catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') {
                throw new Error('Please install mongoose packaage locally. $ yarn add mongoose')
            }

            throw err
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (!this.database.connectionString) {
                reject(new Error('ConnectionString has not been set. Probably context has not been set properly'))
            }
            this.mongoose.connect(this.database.connectionString)

            const connection = this.mongoose.connection

            const errorHandler = e => {
                connection.removeListener('open', openHandler)
                connection.removeListener('error', errorHandler)
                reject(e)
            }

            const openHandler = () => {
                connection.removeListener('error', errorHandler)
                resolve(connection)
            }

            connection.on('error', errorHandler)
            connection.on('open', openHandler)

        })
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            if (this.isClosed) {
                resolve()
            }
            this.mongoose.connection.close()
            this.isClosed = true
            resolve()
        })


    }
}

module.exports = Mongoose