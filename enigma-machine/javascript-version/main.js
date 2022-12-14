//Enigma machine
const Keyboard = require('./keyboard')
const Plugboard = require('./plugboard')
const Rotor = require('./rotor')
const Reflector = require('./reflector')
const Enigma = require('./enigma')

//historical enigma reflectors and rotors
const I = Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q")
const II = Rotor("AJDKSIRUXBLHWTMCQGZNPYFVOE", "E")
const III = Rotor("BDFHJLCPRTXVZNYEIWGAKMUSQO", "V")
const IV = Rotor("ESOVPZJAYQUIRHXLNFTGKDCMWB", "J")
const V = Rotor("VZBRGITYUPSDNHLXAWMJQOFECK", "Z")
const VI = Rotor("JPGVOUMFYQBENHZRDKASXLICTW", "Z" && "M")
const VII = Rotor("NZJHGRCXMYSWBOUFAIVLPEKQDT", "Z" && "M")
const VIII = Rotor("FKQHTLXOCBJSPDZRAMEWNIUYGV", "Z" && "M")
const A = Reflector("EJMZALYXVBWFCRQUONTSPIKHGD")
const B = Reflector("YRUHQSLDPXNGOKMIEBFZCWVJAT")
const C = Reflector("FVPJIAOYEDRZXWGCTKUQSBNMHL")
const B_thin = Reflector("ENKQAUYWJICOPBLMDXZVFTHRGS")
const C_thin = Reflector("ENKQAUYWJICOPBLMDXZVFTHRGS")

// Keyboard and Plugboard
const KB = Keyboard()
const PB = Plugboard(["AB", "CD", "EF"])

//define enigma machine
const ENIGMA = Enigma(B,IV,II,I,PB,KB)

//set the rings
ENIGMA.set_rings((5,1,2))

//set a three letter message key
ENIGMA.set_key("BOR")

//encipher a message
message = "HELLO"
cipher_text = ""
for (letter in message)
    cipher_text = cipher_text + ENIGMA.encipher(letter)
console.log(cipher_text)