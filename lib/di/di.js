const {createContainer, asValue} = require('awilix')

function initDI ({serverSettings, dbSettings, database, rabbitMQ, models}, mediator) {
    mediator.once('init', () => {
        mediator.on('db.ready', (db) => {
            const container = createContainer()
            container.register({
                database: asValue(db),
                users: asValue(models.users),
                operator: asValue(models.operator),
                serverSettings: asValue(serverSettings),
                rabbitmq: asValue(rabbitMQ)
            })

            mediator.emit('di.ready', container)
        })

        mediator.on('db.error', (err) => {
            mediator.emit('di.error', err)
        })

        database.connect(dbSettings, mediator)

        mediator.emit('boot.ready')
    })
}

module.exports.initDI = initDI
