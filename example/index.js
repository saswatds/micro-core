const PedalCore = require('../index')

const config = {
    database: {
        dialect: 'mongoose',
        connectionUrl: 'mongodb://staging:5f78hg54@ds133271.mlab.com:33271/pedal_staging'
    },
    queue: false,
    logger: {
        consoleLevel: 'debug'
    }
}

// Use this model file for mongoose
const model = ({generator}) => {
    const userSchema = {}
    generator('Users', userSchema, (schema) => {
        schema.pre('save', (next) => {
            // Do something, something
        })
    })
}

// Format of all files
const api = ({repo, service}, router) => {
    router.get('/admin', repo.someFunction)
    router.post('/admin', service.someFunction)
}

// Repo should return a object with all the functions
const repo = ({models, logger}) => {
    const {User, Trips} = models

    const someFunction = () => {

    }

    return Object.create({someFunction})
}

const service = ({unirest}) => {
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

