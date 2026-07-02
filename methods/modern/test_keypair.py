import pytest
from unittest.mock import patch
from methods.modern.keypair import (
    is_prime,
    generate_prime,
    generate_keypair,
    generate_encrypted_keypair,
)

def test_is_prime_known_primes():
    primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 97, 101, 7919]
    for p in primes:
        assert is_prime(p) is True

def test_is_prime_known_composites():
    composites = [4, 6, 8, 9, 10, 12, 14, 15, 20, 100, 7920]
    for c in composites:
        assert is_prime(c) is False

def test_is_prime_edge_cases():
    assert is_prime(-1) is False
    assert is_prime(0) is False
    assert is_prime(1) is False

def test_generate_prime():
    bits = 128
    prime = generate_prime(bits)
    assert is_prime(prime) is True
    assert prime.bit_length() == bits

def test_generate_prime_raises_runtime_error_if_failed():
    with patch("methods.modern.keypair.is_prime", return_value=False):
        with pytest.raises(RuntimeError, match="Failed to generate prime"):
            generate_prime(128)

def test_generate_keypair_default_params():
    public_key, private_key = generate_keypair(key_size=512)
    assert isinstance(public_key, bytes)
    assert isinstance(private_key, bytes)
    assert b"-----BEGIN RSA PUBLIC KEY-----" in public_key
    assert b"-----END RSA PUBLIC KEY-----" in public_key
    assert b"-----BEGIN RSA PRIVATE KEY-----" in private_key
    assert b"-----END RSA PRIVATE KEY-----" in private_key

def test_generate_encrypted_keypair():
    passphrase = b"supersecretpassphrase"
    public_key, enc_private_key = generate_encrypted_keypair(passphrase, key_size=512)

    assert isinstance(public_key, bytes)
    assert isinstance(enc_private_key, bytes)
    assert b"-----BEGIN RSA PUBLIC KEY-----" in public_key
    assert b"-----BEGIN ENCRYPTED RSA PRIVATE KEY-----" in enc_private_key
    assert b"-----END ENCRYPTED RSA PRIVATE KEY-----" in enc_private_key

def test_main_function(capsys):
    from methods.modern.keypair import main
    main()
    captured = capsys.readouterr()
    assert "Public Key:" in captured.out
    assert "Private Key:" in captured.out
    assert "-----BEGIN RSA PUBLIC KEY-----" in captured.out
    assert "-----BEGIN RSA PRIVATE KEY-----" in captured.out




def test_fallback_imports():
    """Test fallback imports by masking the modern module temporarily."""
    import sys
    import builtins
    from importlib import reload
    import methods.modern.keypair as keypair_module

    original_import = builtins.__import__

    def mocked_import(name, globals=None, locals=None, fromlist=(), level=0):
        if level > 0 and name in ('', 'symmetric', 'helpers'):
            raise ImportError(f"Mocked ImportError for {name}")
        return original_import(name, globals, locals, fromlist, level)

    with patch("builtins.__import__", side_effect=mocked_import):
        sys.path.insert(0, 'methods/modern')
        try:
            reload(keypair_module)
        finally:
            sys.path.pop(0)

    # Restore the module to original state for other tests
    reload(keypair_module)

def test_generate_keypair_output_primality():
    from methods.modern.helpers import b64decode

    # Generate a keypair
    _, private_key = generate_keypair(key_size=128)

    # Parse the private key
    # Format is:
    # -----BEGIN RSA PRIVATE KEY-----
    # base64_encoded_string
    # -----END RSA PRIVATE KEY-----

    priv_lines = private_key.decode('utf-8').split('\n')
    # Filter out header/footer and empty lines
    b64_str = "".join([line for line in priv_lines if line and not line.startswith('-----')])

    # Decode the base64 string
    decoded_str = b64decode(b64_str).decode('utf-8')

    # The string format is: f"{n}:{public_exponent}:{d}:{p}:{q}"
    parts = decoded_str.split(':')
    assert len(parts) == 5

    n = int(parts[0])
    e = int(parts[1])
    d = int(parts[2])
    p = int(parts[3])
    q = int(parts[4])

    # Verify primality of p and q
    assert is_prime(p) is True
    assert is_prime(q) is True

    # Verify the structure/math
    assert n == p * q
    phi = (p - 1) * (q - 1)
    # Check if e and d are valid inverses
    assert (e * d) % phi == 1
