class Database {

    /**
     * EXAMPLE USAGE
     *
     * const database  = new Database(connectionString, 'dialect')
     * database.connect()
     * */

    constructor(dialectName, connectionString) {

        // Lets set the connection string to be used by the Dailect
        this.connectionString = connectionString
        let ORM
        switch (dialectName) {
            case 'mongoose':
                ORM = require('./Dailect/mongoose')
                break
            default:
                throw new Error(`The ${dialectName} is not yet supported. Make a request in the slack 'api' channel for addition`)
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

    wrappers(Model) {
        return this.orm.wrappers(Model)
    }

    modelGenerator() {
        return ((name, schema, hook) => {
            this.models[name] = this.orm.generateModel(name, schema, hook)
        }).bind(this)
    }

    getModelByName(modelName) {
        if (this.models.hasOwnProperty(modelName)) {
            return this.models[modelName]
        }
        throw  new Error('There is no such model with name ' + modelName)
    }

    getWrapperForModel(modelName) {
        return this.wrappers(this.getModelByName(modelName))
    }
}

module.exports = Database