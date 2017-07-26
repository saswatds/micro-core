class SequelizeORM {

    constructor(database) {
        this.database = database
        this.isClosed = false
        let Sequelize = null
        try {
            Sequelize = require('sequelize')
        } catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') {
                throw new Error('Please install sequelize package locally. $ yarn add sequelize')
            }

            throw err
        }

        if (!this.database.connectionString) {
            throw new Error('ConnectionString has not been set. Probably context has not been set properly')
        }
        this.connection = new Sequelize(this.database.connectionString)

    }

    connect() {
        return new Promise((resolve, reject) => {
            this.connection.authenticate()
                .then(() => {
                    this.isClosed = false
                    resolve(this.connection)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    disconnect() {
        if (this.isClosed) {
            return
        }
        this.connection.close()
        this.isClosed = true
    }
}

module.exports = SequelizeORM