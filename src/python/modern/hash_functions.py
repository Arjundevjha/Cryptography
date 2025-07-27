#class for hash functions
import hashlib

class HashFunction:
    def __init__(self, name, hash_function):
        self.name = name
        self.hash_function = hash_function

    def main(self, data):
        """
        Applies the hash function to the given data.
        
        :param data: The input data to hash.
        :return: The hashed value.
        """
        return self.hash_function(data)
      
    def sha256_hash(self, data):
        """
        Computes the SHA-256 hash of the given data.
        
        :param data: The input data to hash.
        :return: The SHA-256 hash of the data.
        """
        return hashlib.sha256(data.encode()).hexdigest()
      
    def md5_hash(self, data):
        """
        Computes the MD5 hash of the given data.
        
        :param data: The input data to hash.
        :return: The MD5 hash of the data.
        """
        return hashlib.md5(data.encode()).hexdigest()
      
    def sha1_hash(self, data):
        """
        Computes the SHA-1 hash of the given data.
        
        :param data: The input data to hash.
        :return: The SHA-1 hash of the data.
        """
        return hashlib.sha1(data.encode()).hexdigest()
      
    def sha512_hash(self, data):
        """
        Computes the SHA-512 hash of the given data.
        
        :param data: The input data to hash.
        :return: The SHA-512 hash of the data.
        """
        return hashlib.sha512(data.encode()).hexdigest()
      
    def sha3_256_hash(self, data):
        """
        Computes the SHA3-256 hash of the given data.
        
        :param data: The input data to hash.
        :return: The SHA3-256 hash of the data.
        """
        return hashlib.sha3_256(data.encode()).hexdigest()
      
    def blake2b_hash(self, data):
      
        """
        Computes the BLAKE2b hash of the given data.
        
        :param data: The input data to hash.
        :return: The BLAKE2b hash of the data.
        """
        return hashlib.blake2b(data.encode()).hexdigest()
      
    def blake2s_hash(self, data):
        """
        Computes the BLAKE2s hash of the given data.
        
        :param data: The input data to hash.
        :return: The BLAKE2s hash of the data.
        """
        return hashlib.blake2s(data.encode()).hexdigest()
      
      
if __name__ == "__main__":

    data = input("Enter data to hash: ")
    hash_algorithm = input("Enter hash algorithm (sha256, md5, sha1, sha512, sha3_256, blake2b, blake2s): ")

    hash_function = HashFunction(hash_algorithm, getattr(HashFunction, f"{hash_algorithm}_hash"))
    print(f"{hash_algorithm.upper()} Hash: {hash_function.main(data)}")