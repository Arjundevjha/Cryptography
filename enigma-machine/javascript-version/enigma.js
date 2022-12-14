class Enigma {
    constructor(self, re, r1, r2, r3, r4, r5, r6, r7, r8, pb, kb) {
      self.re = re;
      self.r1 = r1;
      self.r2 = r2;
      self.r3 = r3;
      self.r4 = r4;
      self.r5 = r5;
      self.r6 = r6;
      self.r7 = r7;
      self.r8 = r8;
      self.pb = pb;
      self.kb = kb;
    }
  
    set_rings(self, rings) {
      self.r1.set_ring(rings[0]);
      self.r2.set_ring(rings[1]);
      self.r3.set_ring(rings[2]);
    }
  
    set_key(self, key) {
      self.r1.rotate_to_letter(key[0]);
      self.r2.rotate_to_letter(key[1]);
      self.r3.rotate_to_letter(key[2]);
    }
  
    encipher(self, letter) {
      //rotate the rotors
      if (self.r2.left[0] === self.r2.notch && self.r3.left[0] === self.r3.notch) {
        self.r1.rotate();
        self.r2.rotate();
        self.r3.rotate();
      } else if (self.r2.left[0] === self.r2.notch) {
        self.r1.rotate();
        self.r2.rotate();
        self.r3.rotate();
      } else if (self.r3.left[0] === self.r3.notch) {
        self.r2.rotate();
        self.r3.rotate();
      } else {
        self.r3.rotate();
      }
  
      //pass signal through enigma machine
      let signal = self.kb.forward(letter);
      signal = self.pb.forward(signal);
      signal = self.r3.forward(signal);
      signal = self.r2.forward(signal);
      signal = self.r1.forward(signal);
      signal = self.re.reflect(signal);
      signal = self.r1.backward(signal);
      signal = selfis.r2.backward(signal);
      signal = self.r3.backward(signal);
      signal = self.pb.backward(signal);
      letter = self.kb.backward(signal);
      return letter;
    }
  }
  