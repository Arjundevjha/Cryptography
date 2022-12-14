#Enigma machine
from keyboard import Keyboard
from plugboard import Plugboard
from rotor import Rotor
from reflector import Reflector
from enigma import Enigma

#historical enigma rotors and reflectors
I = Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q")
II = Rotor("AJDKSIRUXBLHWTMCQGZNPYFVOE", "E")
III = Rotor("BDFHJLCPRTXVZNYEIWGAKMUSQO", "V")
IV = Rotor("ESOVPZJAYQUIRHXLNFTGKDCMWB", "J")
V = Rotor("VZBRGITYUPSDNHLXAWMJQOFECK", "Z")
VI = Rotor("JPGVOUMFYQBENHZRDKASXLICTW", "Z" and "M")
VII = Rotor("NZJHGRCXMYSWBOUFAIVLPEKQDT", "Z" and "M")
VIII = Rotor("FKQHTLXOCBJSPDZRAMEWNIUYGV", "Z" and "M")
A = Reflector("EJMZALYXVBWFCRQUONTSPIKHGD")
B = Reflector("YRUHQSLDPXNGOKMIEBFZCWVJAT")
C = Reflector("FVPJIAOYEDRZXWGCTKUQSBNMHL")
B_thin = Reflector("ENKQAUYWJICOPBLMDXZVFTHRGS")
C_thin = Reflector("ENKQAUYWJICOPBLMDXZVFTHRGS")

# Keyboard and Plugboard
KB = Keyboard()
PB = Plugboard(["AB", "CD", "EF"])

#define enigma machine
ENIGMA = Enigma(B,IV,II,I,PB,KB)

#set the rings
ENIGMA.set_rings((5,1,2))

#set a three letter message key
ENIGMA.set_key("BOR")


#encipher a message
message = "HELLO"
cipher_text = ""
for letter in message:
    cipher_text = cipher_text + ENIGMA.encipher(letter)
print(cipher_text)