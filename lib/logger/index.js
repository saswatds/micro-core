let winston = null
try {
    winston = require('winston')
} catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') throw new Error('Please install winston package. $ yarn add winston')
    throw err
}

winston.emitErrs = false

class Logger extends winston.Logger {
    constructor(config) {
        super({
            transports: [
                new (winston.transports.Console)({
                    level: config.consoleLevel || 'error',
                    humanReadableUnhandledException: true,
                    handleExceptions: true,
                    json: false,
                    colorize: false
                })
            ],
            exitOnError: false
        })
    }

    stream() {
        return {
            write: (message, encoding) => {
                this.info(message)
            }
        }
    }
}

module.exports = Logger