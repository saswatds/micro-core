# micro-core

Create a production level app by using an opinionated library that handles everything for you.

Configure the application, these are the `default` configuration of the application

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
