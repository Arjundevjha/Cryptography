import hashlib

def sha256(data: str) -> str:
    """
    Compute the SHA-256 hash of the given data.
    
    Args:
        data: The input string to hash
    
    Returns:
        SHA-256 hash as hexadecimal string
    """
    return hashlib.sha256(data.encode()).hexdigest()

def md5(data: str) -> str:
    """
    Compute the MD5 hash of the given data.
    
    Note: MD5 is cryptographically broken and should not be used for security.
    
    Args:
        data: The input string to hash
    
    Returns:
        MD5 hash as hexadecimal string
    """
    return hashlib.md5(data.encode()).hexdigest()

def sha1(data: str) -> str:
    """
    Compute the SHA-1 hash of the given data.
    
    Note: SHA-1 is deprecated for security-sensitive applications.
    
    Args:
        data: The input string to hash
    
    Returns:
        SHA-1 hash as hexadecimal string
    """
    return hashlib.sha1(data.encode()).hexdigest()

def sha512(data: str) -> str:
    """
    Compute the SHA-512 hash of the given data.
    
    Args:
        data: The input string to hash
    
    Returns:
        SHA-512 hash as hexadecimal string
    """
    return hashlib.sha512(data.encode()).hexdigest()

def sha3_256(data: str) -> str:
    """
    Compute the SHA3-256 hash of the given data.
    
    Args:
        data: The input string to hash
    
    Returns:
        SHA3-256 hash as hexadecimal string
    """
    return hashlib.sha3_256(data.encode()).hexdigest()

def blake2b(data: str) -> str:
    """
    Compute the BLAKE2b hash of the given data.
    
    BLAKE2b is optimized for 64-bit platforms and produces digests up to 64 bytes.
    
    Args:
        data: The input string to hash
    
    Returns:
        BLAKE2b hash as hexadecimal string
    """
    return hashlib.blake2b(data.encode()).hexdigest()

def blake2s(data: str) -> str:
    """
    Compute the BLAKE2s hash of the given data.
    
    BLAKE2s is optimized for 8 to 32-bit platforms and produces digests up to 32 bytes.
    
    Args:
        data: The input string to hash
    
    Returns:
        BLAKE2s hash as hexadecimal string
    """
    return hashlib.blake2s(data.encode()).hexdigest()

# Mapping of algorithm names to functions
HASH_FUNCTIONS = {
    'sha256': sha256,
    'md5': md5,
    'sha1': sha1,
    'sha512': sha512,
    'sha3_256': sha3_256,
    'blake2b': blake2b,
    'blake2s': blake2s,
}

def compute_hash(data: str, algorithm: str) -> str:
    """
    Compute hash using the specified algorithm.
    
    Args:
        data: The input string to hash
        algorithm: Name of the hash algorithm (sha256, md5, sha1, sha512, sha3_256, blake2b, blake2s)
    
    Returns:
        Hash digest as hexadecimal string
    
    Raises:
        ValueError: If algorithm is not supported
    """
    if algorithm not in HASH_FUNCTIONS:
        raise ValueError(f"Unsupported algorithm: {algorithm}. Supported: {list(HASH_FUNCTIONS.keys())}")
    return HASH_FUNCTIONS[algorithm](data)

def main():
    data = input("Please enter data to hash: ")
    
    algorithms = list(HASH_FUNCTIONS.keys())
    print(f"\nAvailable algorithms: {', '.join(algorithms)}")
    
    algorithm = input("Enter hash algorithm (or 'all' to show all): ").lower()
    
    if algorithm == 'all':
        print(f"\nInput: {data}\n")
        for algo in algorithms:
            hash_value = compute_hash(data, algo)
            print(f"{algo.upper():12} : {hash_value}")
    else:
        try:
            hash_value = compute_hash(data, algorithm)
            print(f"\nInput: {data}")
            print(f"{algorithm.upper()} Hash: {hash_value}")
        except ValueError as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()