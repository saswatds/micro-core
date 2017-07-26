class Database {

    /**
     * EXAMPLE USAGE
     *
     * const database  = new Database(connectionString, 'dialect')
     * database.connect()
     * */

    constructor (connectionString, dialectName) {

        // Lets set the connection string to be used by the Dailect
        this.connectionString = connectionString

        let ORM
        switch (dialectName) {
            case 'mongoose':
                ORM = require('./Dailect/mongoose')
                break
            case 'sequelize':
                ORM = require('./Dailect/sequelize')
                break
            default:
                throw new Error(`The ${dialectName} is not yet supported. Make a request in the slack 'api' channel for addition`)
        }
        this.orm = new ORM(this)
        this.models = {}
    }

    connect () {
        // This return a promise which signifies if the connection was successful or a failure
        return this.orm.connect()
    }

    disconnect () {
        // We need to it be absolute disconnection
        this.orm.disconnect()
    }
}

models.exports = Database