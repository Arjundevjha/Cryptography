const { createHash } = require('crypto')

function hash(input) {
    return createHash('sha512').update(input).digest('hex')
}
let password = '123456'
const hash1 = hash(password)
console.log("Hash without salt: ", hash1)