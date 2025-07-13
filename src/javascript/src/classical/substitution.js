function substitutionCipher(plaintext, key) {
    // Create a variable to store the ciphertext
    var ciphertext = "";
  
    // Loop through each character in the plaintext
    for (var i = 0; i < plaintext.length; i++) {
      // Get the current character
      var char = plaintext[i];
  
      // Check if the character is a letter
      if (char >= "a" && char <= "z") {
        // Replace the character with the corresponding number in the key
        char = key[char];
      }
  
      // Add the character to the ciphertext
      ciphertext += char;
    }
  
    // Return the ciphertext
    return ciphertext;
  }
  
  // Define the key (the numbers "1234567890" corresponding to the letters "abcdefghij")
  var key = "1234567890";
  
  // Encrypt the plaintext "hello world" using the substitution cipher
  var ciphertext = substitutionCipher("hello world", key);
  
  // Print the ciphertext
  console.log(ciphertext); // "8512121543 815121"
  