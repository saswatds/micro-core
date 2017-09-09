class Rabbot {
  constructor(config) {
    this.topology = config.topology
    try {
      this.rabbot = require('rabbot')
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        throw new Error('Please install rabbot package locally. $ yarn add rabbot')
      }
      throw err
    }

    this.rabbot.on('unreachable', () => {
      this.rabbot.retry()
    })
    this.rabbot.nackOnError();

    if(config.rejectUnhandled) this.rabbot.rejectUnhandled()
    else this.rabbot.nackUnhandled();
  }

  connect() {
    return this.rabbot.configure(this.topology)
  }

  publish(exchange, type, message, key) {
    if(!exchange) return new Error('Exchange is required')
    if(!type) return new Error('Type is required')
    if (!message) return new Error('Message is required')
    
    this.rabbot.publish(exchange, { routingKey: key || "", type , body: message })
  }

  workerRegistrar() {
    return ((name, handler) => {
      this.rabbot.handle(name, (message)=>{
        handler(message.body, (err, data) => {
          if (err) return message.nack()
          if (data) return message.reply(data)
          message.ack()
        })
      })
    }).bind(this)
  }

  disconnect() {
    this.rabbot.shutdown()
  }

}

module.exports = Rabbot