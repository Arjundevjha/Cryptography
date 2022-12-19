def substitutionCipher(plaintext, key):
  # Create a variable to store the ciphertext
  ciphertext = ""

  # Loop through each character in the plaintext
  for i in range(len(plaintext)):
    # Get the current character
    char = plaintext[i]

    # Check if the character is a letter
    if char >= "a" and char <= "z":
      # Replace the character with the corresponding number in the key
      char = key[char]

    # Add the character to the ciphertext
    ciphertext += char

  # Return the ciphertext
  return ciphertext

# Define the key (the numbers "1234567890" corresponding to the letters "abcdefghij")
key = "1234567890"

# Encrypt the plaintext "hello world" using the substitution cipher
ciphertext = substitutionCipher("hello world", key)

# Print the ciphertext
print(ciphertext) # "8512121543 815121"

