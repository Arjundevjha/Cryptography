import pytest
import copy
from methods.historical.enigma.keyboard import Keyboard
from methods.historical.enigma.rotor import Rotor
from methods.historical.enigma.plugboard import Plugboard
from methods.historical.enigma.reflector import Reflector
from methods.historical.enigma.enigma import Enigma

# Enigma components (standard M3)
def get_components():
    I = Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q")
    II = Rotor("AJDKSIRUXBLHWTMCQGZNPYFVOE", "W")
    III = Rotor("BDFHJLCPRTXVZNYEIWGAKMUSQO", "V")
    IV = Rotor("ESOVPZJAYQUIRHXLNFTGKDCMWB", "J")
    V = Rotor("VZBRGITYUPSDNHLXAWMJQOFECK", "Z")

    A = Reflector("EJMZALYXVBWFCRQUONTSPIKHGD")
    B = Reflector("YRUHQSLDPXNGOKMIEBFZCWVJAT")
    C = Reflector("FVPJIAOYEDRZXWGCTKUQSBNMHL")

    return I, II, III, IV, V, A, B, C

def test_enigma_basic_reciprocity():
    """Test that enciphering and deciphering yields the original string."""
    I, II, III, IV, V, A, B, C = get_components()
    KB = Keyboard()
    PB = Plugboard(["AB", "CD", "EF"])

    enigma = Enigma(B, [IV, II, I], PB, KB)
    enigma.set_rings((5, 26, 2))
    enigma.set_key("CAT")

    message = "HELLOWORLD"
    cipher_text = ""
    for letter in message:
        cipher_text += enigma.encipher(letter)

    # Reset enigma
    I, II, III, IV, V, A, B, C = get_components()
    enigma2 = Enigma(B, [IV, II, I], PB, KB)
    enigma2.set_rings((5, 26, 2))
    enigma2.set_key("CAT")

    decrypted_text = ""
    for letter in cipher_text:
        decrypted_text += enigma2.encipher(letter)

    assert decrypted_text == message

def test_enigma_scenario_110():
    """
    Test scenario 110 from TEST_INFRA.md:
    Rotors = I-II-III
    Start positions = M-C-K
    Ring settings = O-P-Q (15, 16, 17)
    Plugboard wiring = "AD FT LY UX"
    Input = "CONGRATULATIONS"
    """
    I, II, III, IV, V, A, B, C = get_components()
    KB = Keyboard()
    PB = Plugboard(["AD", "FT", "LY", "UX"])

    enigma = Enigma(B, [I, II, III], PB, KB)
    enigma.set_rings((15, 16, 17))
    enigma.set_key("MCK")

    message = "CONGRATULATIONS"
    cipher_text = ""
    for letter in message:
        cipher_text += enigma.encipher(letter)

    # Test reciprocity with same settings
    I, II, III, IV, V, A, B, C = get_components()
    PB = Plugboard(["AD", "FT", "LY", "UX"])
    enigma2 = Enigma(B, [I, II, III], PB, KB)
    enigma2.set_rings((15, 16, 17))
    enigma2.set_key("MCK")

    decrypted_text = ""
    for letter in cipher_text:
        decrypted_text += enigma2.encipher(letter)

    assert decrypted_text == message

def test_enigma_double_step():
    """Test the famous Enigma double stepping anomaly."""
    # When rotor 2 is at its notch and steps, it also steps rotor 1 (if the machine was stepping normally)
    I, II, III, IV, V, A, B, C = get_components()
    KB = Keyboard()
    PB = Plugboard([])

    # Notches: I=Q, II=W, III=V
    # To test double stepping, we set the right rotor to U (just before V)
    # and the middle rotor to V (just before W)
    enigma = Enigma(B, [I, II, III], PB, KB)
    enigma.set_key("AVU")

    # Keypress 1: R3 steps to V (its notch). R2 remains V. R1 remains A.
    enigma.encipher("A")
    assert enigma.r3.left[0] == "V"
    assert enigma.r2.left[0] == "V"
    assert enigma.r1.left[0] == "A"

    # Keypress 2: R3 was at V (notch), so R2 steps to W (its notch). R3 steps to W. R1 remains A.
    enigma.encipher("A")
    assert enigma.r3.left[0] == "W"
    assert enigma.r2.left[0] == "W"
    assert enigma.r1.left[0] == "A"

    # Keypress 3: R2 was at W (notch), so R1 steps to B. R2 steps to X. R3 steps to X.
    # This is the double step of the middle rotor!
    enigma.encipher("A")
    assert enigma.r3.left[0] == "X"
    assert enigma.r2.left[0] == "X"
    assert enigma.r1.left[0] == "B"

def test_enigma_normal_step():
    """Test normal stepping of the right and middle rotors."""
    I, II, III, IV, V, A, B, C = get_components()
    KB = Keyboard()
    PB = Plugboard([])

    enigma = Enigma(B, [I, II, III], PB, KB)
    # R3 notch is V. Set to U.
    enigma.set_key("AAU")

    # Keypress 1: R3 to V. R2 remains A.
    enigma.encipher("A")
    assert enigma.r3.left[0] == "V"
    assert enigma.r2.left[0] == "A"
    assert enigma.r1.left[0] == "A"

    # Keypress 2: R3 was at V (notch), so R2 steps to B. R3 steps to W.
    enigma.encipher("A")
    assert enigma.r3.left[0] == "W"
    assert enigma.r2.left[0] == "B"
    assert enigma.r1.left[0] == "A"

def test_enigma_r2_r3_notch_simultaneous():
    """Test the condition where both R2 and R3 are at their notch simultaneously."""
    I, II, III, IV, V, A, B, C = get_components()
    KB = Keyboard()
    PB = Plugboard([])

    # I notch: Q, II notch: W, III notch: V
    # Let's set R3 to its notch (V) and R2 to its notch (W).
    # We want to trigger lines 36-38:
    # if self.r2.left[0] == self.r2.notch and self.r3.left[0] == self.r3.notch:
    #     self.r1.rotate()
    #     self.r2.rotate()
    #     self.r3.rotate()
    enigma = Enigma(B, [I, II, III], PB, KB)
    enigma.set_key("AWV")

    # Keypress 1: R2 is at W (notch), R3 is at V (notch).
    # This should rotate R1, R2, and R3.
    enigma.encipher("A")

    assert enigma.r1.left[0] == "B"
    assert enigma.r2.left[0] == "X"
    assert enigma.r3.left[0] == "W"
