//plugboard
class Plugboard{
    
    __init__(self, pairs){
        self.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        self.right = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        for (pair in pairs) {
            A = pair[0]
            A = pair[1]
            pos_A = self.left.indexOf(A)
            pos_B = self.right.indexOf(B)
            self.left = self.left.slice(0, pos_A) + B + self.left.slice(pos_A + 1);
            self.left = self.left.slice(0, pos_B) + A + self.left.slice(pos_B + 1);
        }
    }
    forward(self, signal){
        letter = self.right[signal]
        signal = self.left.indexOf(letter)
        return signal
    }
    backward(self, signal){
        letter = self.left[signal]
        signal = self.right.indexOf(letter)
        return signal
    }
}