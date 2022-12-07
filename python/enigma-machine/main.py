"""
Reflect: A
Rotors: I-II-III
Plugboard: A-R, G,K, O-X
Message: A => X
"""

from keyboard import Keyboard
from plugboard import Plugboard
from rotor import Rotor
from reflector import Reflector

I = Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q")
II = Rotor("AJDKSIRUXBLHWTMCQGZNPYFVOE", "E")
III = Rotor("BDFHJLCPRTXVZNYEIWGAKMUSQO", "V")
IV = Rotor("ESOVPZJAYQUIRHXLNFTGKDCMWB", "J")
V = Rotor("VZBRGITYUPSDNHLXAWMJQOFECK", "Z")
VI = Rotor("JPGVOUMFYQBENHZRDKASXLICTW", "Z" and "M")
VII = Rotor("NZJHGRCXMYSWBOUFAIVLPEKQDT", "Z" and "M")
VIII = Rotor("FKQHTLXOCBJSPDZRAMEWNIUYGV", "Z" and "M")
Reflector_A = Reflector("EJMZALYXVBWFCRQUONTSPIKHGD")
Reflector_B = Reflector("YRUHQSLDPXNGOKMIEBFZCWVJAT")
Reflector_C = Reflector("FVPJIAOYEDRZXWGCTKUQSBNMHL")
Reflector_B_thin = Reflector("ENKQAUYWJICOPBLMDXZVFTHRGS")
Reflector_C_thin = Reflector("ENKQAUYWJICOPBLMDXZVFTHRGS")
KB = Keyboard()
PB = Plugboard(["AR", "GK", "OX"])

letter = "A"
signal = KB.forward(letter)
signal = PB.forward(signal)
signal = III.forward(signal)
signal = II.forward(signal)
signal = I.forward(signal)
signal = Reflector_A.reflect(signal)
signal = I.backward(signal)
signal = II.backward(signal)
signal = III.backward(signal)
signal = PB.backward(signal)
letter = KB.backward(signal)
print(letter)