from keyboard import Keyboard
from rotor import Rotor
from plugboard import Plugboard
from reflector import Reflector
from enigma import Enigma

#enigma components
I = Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q")
II = Rotor("AJDKSIRUXBLHWTMCQGZNPYFVOE", "W")
III = Rotor("BDFHJLCPRTXVZNYEIWGAKMUSQO", "V")
IV = Rotor("ESOVPZJAYQUIRHXLNFTGKDCMWB", "J")
V = Rotor("VZBRGITYUPSDNHLXAWMJQOFECK", "Z")
VI = Rotor("JPGVOUMFYQBENHZRDKASXLICTW", "M")
VII = Rotor("NZJHGRCXMYSWBOUFAIVLPEKQDT", "Z")
VIII = Rotor("FKQHTLXOCBJSPDZRAMEWNIUYGV", "M")
Beta = Reflector("LEYJVCNIXWPBQMDRTAKZGFUHOS")
Gamma = Reflector("FSOKANUERHMBTIYCWLQPZXVGJD")
A = Reflector("EJMZALYXVBWFCRQUONTSPIKHGD")
B = Reflector("YRUHQSLDPXNGOKMIEBFZCWVJAT")
C = Reflector("FVPJIAOYEDRZXWGCTKUQSBNMHL")
B_thin = Reflector("ENKQAUYWJICOPBLMDXZVFTHRGS")
C_thin = Reflector("RDOBJNTKVEHMLFCWZAXGYIPSUQ")

#keaybard and plugboard
KB = Keyboard()
PB = Plugboard(["AB", "CD", "EF"])

#define enigma machine
ENIGMA = Enigma(B,IV,II,I,PB,KB)

#set the rings
ENIGMA.set_rings((5, 26, 2))

#set message key
ENIGMA.set_key("CAT")

#encipher a message
message = input("Enter the message to encipher: ").upper()
message = message.replace(" ", "").replace(",", "").replace(".", "")
cipher_text = ""
for letter in message:
    cipher_text = cipher_text + ENIGMA.encipher(letter)
print(cipher_text)