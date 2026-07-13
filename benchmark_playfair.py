import time
import random
from methods.classical import playfair

def generate_long_text(length=100000):
    return "".join(random.choices(playfair.ALPHABET, k=length))

def run_benchmark():
    text = generate_long_text(500000)
    key = "secretkey"

    # Measure encryption
    start = time.perf_counter()
    encrypted = playfair.encrypt(text, key)
    encrypt_time = time.perf_counter() - start

    # Measure decryption
    start = time.perf_counter()
    decrypted = playfair.decrypt(encrypted, key)
    decrypt_time = time.perf_counter() - start

    print(f"Encryption time: {encrypt_time:.6f} seconds")
    print(f"Decryption time: {decrypt_time:.6f} seconds")
    return encrypt_time, decrypt_time

if __name__ == "__main__":
    run_benchmark()
