from cryptography.fernet import Fernet

# generate a random key
key = Fernet.generate_key()

# create a Fernet cipher object using the key
cipher = Fernet(key)

# the text to encrypt
text = "Hello, world!"

# encrypt the text
encrypted_text = cipher.encrypt(text.encode("utf-8"))

# decrypt the encrypted text
decrypted_text = cipher.decrypt(encrypted_text)

# print the original and decrypted texts
print("Original text:", text)
print("Decrypted text:", decrypted_text.decode("utf-8"))
