//Rotor
class Rotor{

    __init__(self, wiring, notch){
        self.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        self.right = wiring
        self.notch = notch
    }

    forward(self, signal){
        letter = self.right[signal]
        signal = self.left.indexOf(letter)
        return signal
    }

    backward(self, signal){
        letter = self.right[signal]
        signal = self.left.indexOf(letter)
        return signal
    }

    show(self){
        console.log(self.left)
        console.log(self.right)
        console.log("")
    }

    rotate(self, n=1, forward=true){
        for (i in range(n)) {
            if (forward) {
                self.left = self.left.slice(1) + self.left[0];
                self.right = self.right.slice(1) + self.right[0];
            } else {
                self.left = self.left.slice(25).concat(self.left.slice(0, 25));
                self.right = self.right.slice(25).concat(self.right.slice(0, 25));
            }
        }
    }

    rotate_to_letter(self, letter){
        n = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(letter)
        self.rotate(n)
    }

    set_ring(self, n){

        //rotate the rotor backwards
        self.rotate(n-1, forward=false)

        //adjust the turnover notch in relationship to the wiring
        n_notch = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(self.notch)
        self.notch = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[(n_notch - n) % 26]
    }
}