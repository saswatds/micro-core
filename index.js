const {Express, Database, DI, Queue, Logger} = require('./lib')


class PedalCore {
    constructor(config) {
        // the config has been intialized
        const defaultConfig = {
            name: 'core-service',
            database: {
                dialect: 'mongoose',
                connectionUrl: null
            },
            express: {
                morganStandalone: false, // Make morgan to be standalone and work with winston. Prints to stdout with dev
                morganLevel: 'common',
                CORSenabled: true,
                compressionEnabled: true,
                parseJSON: true,
                parseURLEncoded: true,
                parseHTML: false,
                port: 3000
            },
            queue: {
                dialect: 'rabbot',
                connectionUrl: null
            },
            logger: {
                consoleLevel: 'info'
            }
        }
        this._config = Object.assign(defaultConfig, config)

        this.logger = new Logger(this._config.logger)
        // Lets create the different object based on the config
        if (this._config.database) this.database = new Database(this._config.database.dialect, this._config.database.connectionUrl)
        if (this._config.queue) this.queue = new Queue(this._config.queue.dialect, this._config.queue.connectionUrl)
        if (this._config.express) this.express = new Express(this._config.express, this.logger)

        // Lets initiate the dependency injection procedure
        this.di = new DI(this)

        this.apiGenerator = null
        this.modelGenerator = null
        this.serviceGenerator = null
        this.queueGenerator = null
        this.logger.debug('Core has been constructed...')
    }

    registerApi(apiGenerator) {
        /*
         *  The api generator is a function that takes dependences as paraments
         * const apiGenerator = ({router, repo, service}) => {
         *   router.get('/admin', repo.someFunction)
         *   router.post('/admin', service.someFunction)
         *  }
         * */
        this.apiGenerator = apiGenerator
        this.logger.debug('Api Generator has been set')
    }

    registerRepo(repoGenarator) {
        // The repo Generator is also one more generator function that takes the dependencies as parameter
        this.repoGenarator = repoGenarator
        this.logger.debug('Repo Generator has been set')

    }

    registerService(serviceGenerator) {
        this.serviceGenerator = serviceGenerator
        this.logger.debug('Service Generator has been set')

    }

    registerModels(modelGenerator) {
        this.modelGenerator = modelGenerator
        this.logger.debug('Model Generator has been set')

    }

    connectDB() {
        if (!this.database) return Promise.resolve()
        this.logger.debug('Connecting to database')
        this.database.connect()
    }

    connectQueue() {
        if (!this.queue) return Promise.resolve()
        this.logger.debug('Connecting to queue')
        return this.queue.connect()
    }


    startExpress() {
        if (!this.express) return Promise.resolve()
        this.logger.debug('Starting express')
        return this.express.start()
    }

    start() {
        // The is the main orchestrator function
        if (this.database && this.modelGenerator) {
            // pre >> prepare all the model and set them at database
            //TODO: Probally have to convert to an array
            this.modelGenerator({generator: this.database.modelGenerator()})
            this.di.registerValue({models: this.database.models})
        }
        // pre >> prepare all the exchanges and queues
        if (this.queue && this.queueGenerator) {
            this.logger.warn("The queue implementation has not yet been completed")
            //TODO: Add the queue to the dependency
        }

        // register all services
        if (this.serviceGenerator) {
            // TODO: Bind to the dependency injection procedure

            const service = this.serviceGenerator.call(null, this.di.container.cradle)
            this.di.registerValue({service})
        }

        if (this.repoGenarator) {
            const repo = this.repoGenarator.call(null, this.di.container.cradle)
            this.di.registerValue({repo})
        }

        if (this.express && this.apiGenerator) {
            const bindedGenerator = this.apiGenerator.bind(null, this.di.container.cradle)
            this.express.registerRoutes(bindedGenerator)
        }
        Promise.all([
            this.connectDB(),
            this.connectQueue()
        ]).then(() => {
            return this.startExpress()
        }).then(() => {
            this.logger.info(`${this._config.name} has started ... `)
        }).catch((err) => {
            this.logger.error(err)
        })
    }
}

module.exports = PedalCore