def vernam_cipher(message, key):
  # Convert the message and key into a list of ASCII values
  message_values = [ord(c) for c in message]
  key_values = [ord(c) for c in key]

  # Zip the message values and key values together and apply the XOR operation
  # to each pair of values
  cipher_values = [m ^ k for m, k in zip(message_values, key_values)]

  # Convert the resulting cipher values back into characters and return the
  # resulting ciphertext
  return ''.join([chr(v) for v in cipher_values])

print(vernam_cipher("Hello", "e"))