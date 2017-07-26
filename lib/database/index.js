class Database {

    /**
     * EXAMPLE USAGE
     *
     * const database  = new Database(connectionString, 'dialect')
     * database.connect()
     * */

    constructor(connectionString, ormName) {

        // Lets set the connection string to be used by the ORM
        this.connectionString = connectionString

        let ORM
        switch (ormName) {
            case 'mongoose':
                ORM = require('./ORM/mongoose')
                break
            case 'sequelize':
                ORM = require('./ORM/sequelize')
                break
            default:
                throw new Error(`The ${ormName} is not yet supported. Make a request in the slack 'api' channel for addition`)
        }
        this.orm = new ORM(this)
        this.models = {}
    }

    connect() {
        // This return a promise which signifies if the connection was successful or a failure
        return this.orm.connect()
    }

    disconnect() {
        // We need to it be absolute disconnection
        this.orm.disconnect()
    }
}

models.exports = Database