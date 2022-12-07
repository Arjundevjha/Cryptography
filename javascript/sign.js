const { createSign, createVerify } = require('crypto')
const { publicKey, privateKey } = require('./keypair')

const message = 'This is a test'

const signer = createSign('rsa-sha256')

signer.update(message)

const signature = signer.sign(privateKey, 'hex')

const verify = createVerify('rsa-sha256')

verify.update(message)

const isVerified = verifer.verifer(publicKey, signature, 'hex')