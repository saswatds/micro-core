class Express {
    constructor(context) {
        this.context = context
        let express = null
        try {
            express = require('express')
        } catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') {
                throw new Error('Please install express package locally. $ yarn add express')
            }
            throw err
        }
        if (!this.context._config) {
            throw new Error('Config has not been set. context has not been set properly')
        }
        this.config = this.context._config
        this.app = express()

        this._errorLogger = (err, req, res, next) => {
            this.context.logger.error(err)
            next(err)
        }

        this._errorHandler = (err, req, res, next) => {
            res.status(500).json({code: 500, message: 'Internal Server Error', trace: err})
        }
    }

    setErrorLogger(errorLogger) {
        this._errorLogger = errorLogger
    }

    addMiddleware() {
        const morgan = require('morgan')
        const bodyparser = require('body-parser')

        // If morgan has been marked stadalone then set it output dev
        if (this.config.morganStandalone) {
            this.app.use(morgan('dev'))
        } else {
            this.app.use(morgan(this.config.morganLevel, {'stream': this.context.logger.stream}))
        }

        // Enable OOCRS
        if (this.config.CORSenabled) {
            const cors = require('cors')
            this.app.use(cors())
        }

        // Compression Enabled
        if (this.config.CompressionEnabled) {
            const compression = require('compression')
            this.app.use(compression())
        }

        // Parse JSON
        if (this.config.passeJSON) {
            this.app.use(bodyparser.json())
        }

        // Parse URLEncoded
        if (this.config.parseURLEncoded) {
            this.app.use(bodyparser.urlencoded({extended: false}))
        }

        // Parse HTML
        if (this.config.parseHTML) {
            this.app.use(bodyparser.text({type: 'text/html'}))
        }

        this.app.use(this._errorLogger)


        // TODO: Add the router codee

    }
}