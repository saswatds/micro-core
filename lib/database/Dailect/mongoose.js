class MongooseORM {

    constructor(database) {
        this.database = database
        this.isClosed = false
        try {
            this.mongoose = require('mongoose')
            this.mongoose.Promise = global.Promise
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
            this.connection = this.mongoose.connect(this.database.connectionString, { useMongoClient: true })

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
        if (hook) hook(_schema)
        return this.mongoose.model(name, _schema)
    }

    wrappers(Model) {
        // Handeling GET /
        const find = (payload) => {

            const { sort, select, limit, page } = payload
            delete payload.sort
            delete payload.select
            delete payload.limit
            delete payload.page

            let Query = Model
                .find({})    
                .sort(sort)
                .lean(true)
                .select(select)
            
            const query = payload
            for (let q of Reflect.ownKeys(query)) {
                // Lets iterator over each key and add it to the where clause
                const f = q.split('__')
                const v = f[1]!=='in'? query[q]:query[q].split(',')
                (Query.where(f[0]))[f[1]||'equals'](v)
            }

            if (limit) {
                let _skip, _page, promises
                if (page) {
                    _page = parseInt(page)
                    _skip = (_page - 1) * limit
                } else {
                    _page = 1
                    _skip = 0
                }
                Query
                    .limit(+limit)
                    .skip(_skip)

                promises = {
                    docs: Query.exec(),
                    count: Model.count(query).exec()
                }

                promises = Object.keys(promises).map((x) => promises[x])
                return Promise
                    .all(promises)
                    .then(([docs, count]) => {
                        let result = {
                            docs: docs,
                            count: count,
                            limit: +limit
                        }
                        if (page !== undefined) {
                            result.page = _page;
                            result.pages = Math.ceil(count / limit) || 1;
                        }
                        return Promise.resolve(result)
                    })
            } else {
                return Query.exec()
            }
        }

        // Handelling GET /:id

        const findOne = ({ id }, { select }) => {
            const _id = new this.mongoose.Types.ObjectId(id)
            return Model.findOne({ $or: [{ '_id': _id }, { 'userId': _id }] }, select).lean().exec()
        }
        // Handelling POST /

        const create = (body) => {
            return (new Model(body)).save()
        }

        //Handelling PUT /:id
        const update = ({ id }, body) => {
            if (body._id && body._id === id) {
                delete body._id
            }

            const _id = new this.mongoose.Types.ObjectId(id)
            // ability to update by both id and userId
            return Model.findOneAndUpdate({ $or: [{ '_id': _id }, { 'userId': _id }] }, body, { new: true }).exec()
        }

        //Handelling DELETE /:id
        const remove = ({ id }) => {
            const _id = new this.mongoose.Types.ObjectId(id)
            // ability to update by both id and userId
            return Model.findOneAndRemove({ $or: [{ '_id': _id }, { 'userId': _id }] }).exec()
        }

        return Object.create({ find, findOne, create, update, remove })
    }
}

module.exports = MongooseORM