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

    getModels() {

    }

    setModels(models) {
        // New to do a lot of things here
    }

}


module.exports = function () {
    if (!this._config) {
        throw new Error('_config not found in context. Make sure context is bound with .apply(this)')
    }
    return {
        connect: (connectionString) => {
            return new Promise((resolve, reject) => {
                let connection = null
                switch (this._config.database) {
                    case 'mongoose':
                        connection = require('./mongoose')
                        break
                    case 'sequelize':
                        connection = require('./sequelize')
                        break
                    default:
                        reject(new Error('Proper database ORM has not been set'))
                }
                return connection.connect.call(this, connectionString)
            })
        }
    }
}
