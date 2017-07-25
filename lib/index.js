'use strict'

const {EventEmitter} = require('events')
const server = require('./server/server')
const repository = require('./repository/repository')
const di = require('./config')
const logger = require('./logger')

const mediator = new EventEmitter()

logger.debug('Connecting to user repository')

process.on('uncaughtException', (err) => {
    logger.error('Unhandled Exception', err)
})

process.on('uncaughtRejection', (err, promise) => {
    logger.error('Unhandled Rejection', err)
})

mediator.on('di.ready', (container) => {
    repository.connect(container)
        .then(repo => {
            logger.debug('Connected. Starting Server')
            container.registerValue({repo})
            return server.start(container)
        })
        .then(app => {
            logger.info(`user-service running on port: ${container.cradle.serverSettings.port}.`)
            app.on('close', () => {
                container.resolve('repo').disconnect()
            })
        })
})

di.init(mediator)

mediator.emit('init')
