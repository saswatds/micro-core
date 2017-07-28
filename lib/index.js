const Queue = require('./queue')
const Express = require('./express')
const Database = require('./database')
const DI = require('./di')
const Logger = require('./logger')

module.exports = Object.assign({}, {Queue, Express, Database, DI, Logger})