const { createHmac } = require('crypto')
const { create } = require('domain')

const key = 'Ceaser'
const message = 'This is a test'

const hmac = createHmac('sha256', key).update(message).digest('hex')

console.log(hmac)