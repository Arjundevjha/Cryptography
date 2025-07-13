function vigenereCipher(text, key) {
    // create an alphabet string
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
  
    // create a shifted alphabet string for each letter of the key
    const shiftedAlphabets = key
      .split("")
      .map((keyLetter) => {
        const keyIndex = alphabet.indexOf(keyLetter);
        return alphabet.slice(keyIndex) + alphabet.slice(0, keyIndex);
      });
  
    // create an array of the characters in the text
    const textChars = text.split("");
  
    // create an array of the encrypted characters
    const encryptedChars = textChars.map((char, index) => {
      // get the shifted alphabet for this character
      const shiftedAlphabet = shiftedAlphabets[index % key.length];
  
      // get the index of the character in the alphabet
      const charIndex = alphabet.indexOf(char);
  
      // if the character is not in the alphabet, return it as-is
      if (charIndex === -1) return char;
  
      // return the encrypted character
      return shiftedAlphabet[charIndex];
    });
  
    // return the encrypted text
    return encryptedChars.join("");
  }
  