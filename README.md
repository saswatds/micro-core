# micro-core

Create a production level app by using an opinionated library that handles everything for you.

## Install

`npm install @saswatds/micro-core`

## Usage

#### Config
Define the configuration for the application, these are the `default` configuration predefined.

``` javascript
const config = {
      name: 'core-service',
      database: {
        dialect: 'mongoose',
        connectionUrl: 'mongodb://[username:password@]host1[:port1][/[database][?options]]'
      },
      express: {
        name: 'core-service',
        morganStandalone: false, 
        morganLevel: 'common',
        CORSenabled: true,
        compressionEnabled: true,
        parseJSON: true,
        parseURLEncoded: true,
        parseHTML: false,
        healthCheck: true,
        enableTracing: false,
        port: 3000,
      },
      queue: false,
      logger: {
        consoleLevel: 'info'
      },
      restifier: false
    }
```

* `name` (optional) - The name of the application to be used when logging. If left blank  *core-service* is used
* `database` - The database config needs to either set to false or an object needs to be passed with dialect and connectionUrl
  - `dialect` (optional) - the default is set to *mongoose*. Currently only mongoose is supported
  - `connectionUrl` - this field is required and you will need to send in the connection url to connection to the mongodb instance
* `express` - The express configs can either be set to false to disable express or an empty object `{}` to use all default configuration
  - `morganStandlone` - Setting this to `true` will prevent morgan http logger to not stream logs through wiston but print them directly to the console. the default setting is `false`
  - `morganLevel` - This is log type that morgan should use to format the log. Default to common
  - `CORSenable` - This setting lets you configure to allow CORS on the server. The default is true
  - `compressionEnabled` - Setting this to true will enable gzip compression for all the endpoints. The default is true
  - `parseJSON` - Setting this true will parse json data sent in a post request and set it tp `req.body`
  -  `parseURLEncoded` - Setting this true will parse url encoded data in post request and add it to the `req.body`
  - `parseHTML` - Setting this will allow you to parse html data sent with post request - Default is false
  - `healthCheck` - This add a health check endpoint `/_health to know is the service is responsive
  - `enableTracing` - Defaults to false. Used to enable amazon xray tracing. You will also need the xray file in the root of your project.
  - `port` - This is the port that express will listen to. The default is port 3000
* `queue` - Setting this to an object with a property topology will enable a rabbot instance that you can use to connect to RabbitMQ.
  - [`topology`](https://github.com/arobson/rabbot#configuration-via-json) - This is an object that should contain the topological descriptions about the rabbitmq connection 
    - `connection`
    - `exchanges`
    - `queues`
    - `bindings`
* `logger` - This object contains a property `consoleLevel` that can be set to required log level of winston log library

* `restifier` - The restifier is on of the powerful feature of the library that takes a Mongoose model as parameter and generates a rest-api using that model. The restifier is passed as a dependency to the api generators

#### Dependency Injection
- `request` - An instance of Super agent
- `logger` - 

#### Model Generator

The model generator is a function where the different mongoose Schema's are defined, and using a generator function mongoose models are generated.

```javascript
// Use this model file for mongoose
const model = ({generator, _this}, <di>) => {
    const testSchema = {
        _id: _this.mongoose.Schema.Types.ObjectId
        value: Number
    }
    generator('Test', testSchema, (schema) => {
        schema.pre('save', (next) => {
            next()
        })
    })
}
```

The model generator is parametered with a `generator` function and `_this` a reference to the underlieing orm being used. The _this can be used to access schema constants required while defining schema. The second parameter is a reference to the dipendencies.

The generator function take 3 arguments, 
- name of the model
- schema object
- optional hook function that would be called with the schema post generation but before model generation. You can use this schema to add pre and post hooks to the schema

