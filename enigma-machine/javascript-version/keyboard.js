//keyboard
class Keyboard{
    forward(self, letter){
        signal = "ABCDEFGHIJKLMNOQRSTUVWXYZ".indexOf(letter)
        return signal
    }

    backward(self, signal){
        letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[letter]
        return letter
    }
}