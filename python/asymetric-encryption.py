from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

# generate a private and public key pair
private_key = rsa.generate_private_key(
  public_exponent=65537,
  key_size=2048
)
public_key = private_key.public_key()

# the text to encrypt
text = "Hello, world!"

# encrypt the text using the public key
encrypted_text = public_key.encrypt(
  text.encode("utf-8"),
  padding.OAEP(
    mgf=padding.MGF1(algorithm=hashes.SHA256()),
    algorithm=hashes.SHA256(),
    label=None
  )
)

# decrypt the encrypted text using the private key
decrypted_text = private_key.decrypt(
  encrypted_text,
  padding.OAEP(
    mgf=padding.MGF1(algorithm=hashes.SHA256()),
    algorithm=hashes.SHA256(),
    label=None
  )
)

# print the original and decrypted texts
print("Original")
