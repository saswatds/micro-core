class MongooseORM {

    constructor(database) {
        this.database = database
        this.isClosed = false
        try {
            this.mongoose = require('mongoose')
        } catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') {
                throw new Error('Please install mongoose package locally. $ yarn add mongoose')
            }
            throw err
        }
        if (!this.database.connectionString) {
            throw new Error('ConnectionString has not been set. Probably context has not been set properly')
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.connection = this.mongoose.createConnection(this.database.connectionString, {useMongoClient: true})

            const errorHandler = e => {
                console.log(e)
                this.connection.removeListener('open', openHandler)
                this.connection.removeListener('error', errorHandler)
                reject(e)
            }

            const openHandler = () => {
                this.isClosed = false
                this.connection.removeListener('error', errorHandler)
                resolve(this.connection)
            }

            this.connection.on('error', errorHandler)
            this.connection.once('open', openHandler)

        })
    }

    disconnect() {
        if (this.isClosed) {
            return
        }
        this.connection.close()
        this.isClosed = true
    }

    generateModel(name, schema, hook) {
        // TODO: Check if its mongoose schema
        const _schema = new this.mongoose.Schema(schema)
        if (hook) hook.call(this, _schema)
        return this.mongoose.model(name, _schema)
    }

    wrappers(Model) {
        // Handeling GET /
        const find = ({query, limit, sort, select, page}) => {
            let Query = Model
                .find(query || {})
                .sort(sort)
                .lean(true)
                .select(select)

            if (limit) {
                let _skip, _page, promises
                if (page) {
                    _page = page
                    _skip = (page - 1) * limit
                } else {
                    _page = 1
                    _skip = 0
                }
                Query
                    .limit(limit)
                    .skip(_skip)

                promises = {
                    docs: Query.exec(),
                    count: Model.count(query).exec()
                }

                promises = Object.key(promises).map((x) => promises[x])
                return Promise
                    .all(promises)
                    .then((data) => {
                        let result = {
                            docs: data.docs,
                            count: data.count,
                            limit: limit
                        }
                        if (page !== undefined) {
                            result.page = page;
                            result.pages = Math.ceil(data.count / limit) || 1;
                        }
                        return Promise.resolve(result)
                    })
            } else {
                return Query.exec()
            }
        }

        // Handelling GET /:id

        const findOne = ({id}, {select}) => {
            return Model.findById(id, select).lean().exec()
        }
        // Handelling POST /

        const create = (body) => {
            return (new Model(body)).save()
        }

        //Handelling PUT /:id
        const update = ({id}, body) => {
            if (body._id && body._id === id) {
                delete body._id
            }

            return Model.findByIdAndUpdate(id, body, {new: true}).exec()
        }

        //Handelling DELETE /:id
        const remove = ({id}) => {
            return Model.findByIdAndRemove(id).exec()
        }

        return Object.create({find, findOne, create, update, remove})
    }
}

module.exports = MongooseORM