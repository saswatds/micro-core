const status = require('http-status')

class Restifer {
    constructor(database, express) {
        this.database = database
        this.router = express.router
    }

    populate(baseRoute, modelName) {
        // Lets gate the model by its name
        const wrappers = this.database.getWrapperForModel(modelName)

        this.router.get(baseRoute, (req, res, next) => {
            wrappers
                .find(req.query)
                .then((data) => {
                    res.status(status.OK).json(data)
                })
                .catch((err) => {
                    // now lets filer out the error on its type
                    next(err)
                })
        })

        this.router.get(`${baseRoute}/:id`, (req, res, next) => {
            wrappers
                .findOne(req.params, req.query)
                .then((data) => {
                    res.status(status.OK).json(data)
                })
                .catch((err) => {
                    next(err)
                })
        })

        this.router.post(baseRoute, (req, res, next) => {
            wrappers
                .create(req.body)
                .then((data) => {
                    res.status(status.CREATED).json(data)
                })
                .catch((err) => {
                    next(err)
                })
        })

        this.router.put(`${baseRoute}/:id`, (req, res, next) => {
            wrappers
                .update(req.params, req.body)
                .then((data) => {
                    res.status(status.OK).json(data)
                })
                .catch((err) => {
                    next(err)
                })
        })

        this.router.delete(`${baseRoute}/:id`, (req, res, next) => {
            wrappers
                .remove(req.params)
                .then((data) => {
                    res.status(status.OK).json(data)
                })
                .catch((err) => {
                    next(err)
                })
        })
    }
}


module.exports = Restifer