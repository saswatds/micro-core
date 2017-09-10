const PedalCore = require('../index')

const config = {
    database: {
        dialect: 'mongoose',
        connectionUrl: 'mongodb://staging:5f78hg54@ds133271.mlab.com:33271/pedal_staging'
    },
    queue: false,
    logger: {
        consoleLevel: 'debug'
    },
    restifier: true
}

// Use this model file for mongoose
const model = ({generator}) => {
    const testSchema = {
        value: Number
    }
    generator('Test', testSchema, (schema) => {
        schema.pre('save', (next) => {
            console.log(this)
            next()
        })
    })
}

// Format of all files
const api = ({repo, restifier}, router) => {
    router.get('/test/repo', repo.someFunction)

    // The route and then the model name
    restifier.populate('/test/rest', 'Test')
}

// Repo should return a object with all the functions
const repo = ({models, logger}) => {
    const someFunction = (req, res, next) => {
        res.send('OK')
    }

    return Object.create({someFunction})
}

const service = ({request}) => {
    const someFunction = () => {

    }
    return Object.create({someFunction})
}

const core = new PedalCore(config)
core.registerApi(api)
core.registerModels(model)
core.registerRepo(repo)
core.registerService(service)
core.start()

