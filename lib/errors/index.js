const AppError = require('./AppError')

class NotImplementedYet extends AppError {
    constructor(message) {
        super(message || 'The requested feature has not yet been implemented', 501)
    }
}

class NotFoundError extends AppError {
    constructor(message) {
        super(message || 'Requested Resource Not Found', 404)
    }
}

class MalformedError extends AppError {
    constructor(message) {
        super(message || 'Object probably marformed', 406)
    }
}

class BadRequest extends AppError {
    constructor(message) {
        super(message || 'Bad request', 400)
    }
}

module.exports = Object.assign({}, {NotFoundError, MalformedError, BadRequest, NotImplementedYet})
