class Express {
    constructor(config, logger) {
        let express = null
        try {
            express = require('express')
        } catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') throw new Error('Please install express package locally. $ yarn add express')
            throw err
        }
        if (!config || !logger) throw new Error('config and logger are mandatory parameters')

        this.config = config
        this.logger = logger
        this.app = express()
        this.router = express.Router()

        this.prepared = false

        this._errorLogger = (err, req, res, next) => {
            this.logger.error(err)
            next(err)
        }

        this._errorHandler = (err, req, res, next) => {
            if (err.name !== 'Error') {
                return res.status(err.status).json({ code: err.status, message: err.message })
            }
            res.status(500).json({ code: 500, message: 'Internal Server Error', trace: err })
        }

        this._closeHandler = () => {
            this.logger.info(`server has closed`)
        }
    }

    setCloseHandler(closeHandler) {
        this._closeHandler = closeHandler
    }

    registerRoutes(routerGenerator) {
        routerGenerator(this.router)
    }

    prepare() {
        if (this.prepared) {
            throw new Error('Express has already been prepared')
        }
        const AWSXRay = require('aws-xray-sdk')
        if (this.config.enableTracing) {
            this.app.use(AWSXRay.express.openSegment(this.config.name))
        }

        const morgan = require('morgan')
        // If morgan has been marked stadalone then set it output dev
        if (this.config.morganStandalone) {
            this.app.use(morgan('dev'))
        } else {
            this.app.use(morgan(this.config.morganLevel, { 'stream': this.logger.stream() }))
        }

        // Enable OOCRS
        if (this.config.CORSenabled) {
            const cors = require('cors')
            this.app.use(cors())
        }

        // Compression Enabled
        if (this.config.compressionEnabled) {
            const compression = require('compression')
            this.app.use(compression())
        }

        const bodyparser = require('body-parser')
        // Parse JSON
        if (this.config.parseJSON) {
            this.app.use(bodyparser.json())
        }

        // Parse URLEncoded
        if (this.config.parseURLEncoded) {
            this.app.use(bodyparser.urlencoded({ extended: false }))
        }

        // Parse HTML
        if (this.config.parseHTML) {
            this.app.use(bodyparser.text({ type: 'text/html' }))
        }

        // -------- BIND ROUTER -----------
        this.app.use('/', this.router)

        // Instrument code
        if (this.config.enableTracing) {
            this.app.use(AWSXRay.express.closeSegment());
        }

        // Use error Logger
        this.app.use(this._errorLogger)


        // Use error Handler
        this.app.use(this._errorHandler)

    }

    start() {
        return new Promise((resolve, reject) => {
            // if express has not yet been prepared then prepare it
            if (!this.prepared) this.prepare()
            // Lets start the server and resolve the server to used later
            const server = this.app.listen(this.config.port, () => {
                // TODO: Not removing this listener, might cause a memory leak
                server.on('close', this._closeHandler)
                resolve(server)
            })

            server.on('error', (err) => {
                if (err.errno === 'EADDRINUSE') {
                    reject(new Error(`Port: ${this.config.port} is already in use, use another port `))
                } else {
                    reject(err)
                }
            })
        })
    }
}


module.exports = Express