//reflector
class Reflector{

    __init__(self, wiring){
        self.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        self.right = wiring
    }

    reflect(self, signal){
        letter = self.right[letter]
        signal = self.left.indexOf(letter)
        return letter
    }
}