import pytest
import os
from unittest.mock import patch
from methods.modern.rsa import (
    _parse_pem,
    encrypt,
    decrypt,
    decrypt_private_key,
)
from methods.modern.keypair import (
    generate_keypair,
    generate_encrypted_keypair,
)

def test_parse_pem_public_key():
    pub_pem, _ = generate_keypair(key_size=512)
    header = "-----BEGIN RSA PUBLIC KEY-----"
    footer = "-----END RSA PUBLIC KEY-----"
    key_params = _parse_pem(pub_pem, header, footer)
    assert len(key_params) == 2
    n, e = key_params
    assert e == 65537
    assert n > 0

def test_parse_pem_private_key():
    _, priv_pem = generate_keypair(key_size=512)
    header = "-----BEGIN RSA PRIVATE KEY-----"
    footer = "-----END RSA PRIVATE KEY-----"
    key_params = _parse_pem(priv_pem, header, footer)
    assert len(key_params) == 5
    n, e, d, p, q = key_params
    assert e == 65537
    assert n > 0
    assert d > 0
    assert p > 0
    assert q > 0

def test_encrypt_decrypt_standard_message():
    pub_pem, priv_pem = generate_keypair(key_size=512)
    message = "Secret message for RSA"
    ciphertext = encrypt(message, pub_pem)

    assert isinstance(ciphertext, bytes)
    assert len(ciphertext) > 0

    decrypted_message = decrypt(ciphertext, priv_pem)
    assert decrypted_message == message

def test_encrypt_decrypt_empty_message():
    pub_pem, priv_pem = generate_keypair(key_size=512)
    message = ""
    ciphertext = encrypt(message, pub_pem)

    assert isinstance(ciphertext, bytes)
    assert len(ciphertext) == 0

    decrypted_message = decrypt(ciphertext, priv_pem)
    assert decrypted_message == message

def test_encrypt_decrypt_large_message():
    pub_pem, priv_pem = generate_keypair(key_size=512)
    message = "A" * 1000
    ciphertext = encrypt(message, pub_pem)

    assert isinstance(ciphertext, bytes)
    assert len(ciphertext) > 0

    decrypted_message = decrypt(ciphertext, priv_pem)
    assert decrypted_message == message

def test_encrypt_decrypt_unicode_message():
    pub_pem, priv_pem = generate_keypair(key_size=512)
    message = "Hello World 🔑🔒! Café & Naïve Unicode 🔏"
    ciphertext = encrypt(message, pub_pem)

    assert isinstance(ciphertext, bytes)
    assert len(ciphertext) > 0

    decrypted_message = decrypt(ciphertext, priv_pem)
    assert decrypted_message == message

def test_decrypt_encrypted_private_key():
    passphrase = b"supersecretpassphrase"
    pub_pem, enc_priv_pem = generate_encrypted_keypair(passphrase, key_size=512)

    decrypted_priv_pem = decrypt_private_key(enc_priv_pem, passphrase)
    assert b"-----BEGIN RSA PRIVATE KEY-----" in decrypted_priv_pem

    # Verify that the decrypted key can be used
    message = "Test with encrypted key"
    ciphertext = encrypt(message, pub_pem)
    decrypted_message = decrypt(ciphertext, decrypted_priv_pem)

    assert decrypted_message == message

def test_main_unencrypted_keypair(capsys):
    from methods.modern.rsa import main
    # Ensure RSA_PASSPHRASE is not set
    with patch.dict(os.environ, clear=True):
        main()
        captured = capsys.readouterr()
        assert "--- Testing Unencrypted Keypair ---" in captured.out
        assert "Decrypted message: Secret message for RSA" in captured.out
        assert "--- Skipping Encrypted Keypair Test ---" in captured.out

def test_main_encrypted_keypair(capsys):
    from methods.modern.rsa import main
    with patch.dict(os.environ, {"RSA_PASSPHRASE": "testpassphrase"}):
        main()
        captured = capsys.readouterr()
        assert "--- Testing Unencrypted Keypair ---" in captured.out
        assert "Decrypted message: Secret message for RSA" in captured.out
        assert "--- Testing Encrypted Keypair ---" in captured.out
        assert "Decrypted message (with encrypted key): Secret message for RSA" in captured.out

def test_fallback_imports():
    """Test fallback imports by masking the modern module temporarily."""
    import sys
    import builtins
    from importlib import reload
    import methods.modern.rsa as rsa_module

    original_import = builtins.__import__

    def mocked_import(name, globals=None, locals=None, fromlist=(), level=0):
        if level > 0 and name in ('', 'symmetric', 'helpers', 'keypair'):
            raise ImportError(f"Mocked ImportError for {name}")
        return original_import(name, globals, locals, fromlist, level)

    with patch("builtins.__import__", side_effect=mocked_import):
        sys.path.insert(0, 'methods/modern')
        try:
            reload(rsa_module)
            assert callable(rsa_module.aes_decrypt)
            assert callable(rsa_module.b64decode)
            assert callable(rsa_module.sha256)
            assert callable(rsa_module.generate_keypair)
            assert callable(rsa_module.generate_encrypted_keypair)
        finally:
            sys.path.pop(0)

    # Restore the module to original state for other tests
    reload(rsa_module)

def test_rsa_decrypt_private_key_wrong_passphrase():
    passphrase = b"correct_passphrase"
    public_key, enc_private_key = generate_encrypted_keypair(passphrase, key_size=512)

    wrong_passphrase = b"wrong_passphrase"

    with pytest.raises(Exception):
        # We expect some exception, most likely a ValueError from incorrect padding,
        # or UnicodeDecodeError due to garbage bytes when attempting to decode the PEM
        decrypt_private_key(enc_private_key, wrong_passphrase)

def test_decrypt_with_trailing_empty_block():
    pub_pem, priv_pem = generate_keypair(key_size=512)
    message = "Test block"
    ciphertext = encrypt(message, pub_pem)

    # _parse_pem returns key_params [n, e, d, p, q] for private key
    header = "-----BEGIN RSA PRIVATE KEY-----"
    footer = "-----END RSA PRIVATE KEY-----"
    key_params = _parse_pem(priv_pem, header, footer)
    n = key_params[0]
    key_size_bytes = (n.bit_length() + 7) // 8

    # Pad ciphertext with zero bytes that are a multiple of key_size_bytes
    # or append empty slice at the end to trigger `if not (block := ...): continue`
    # In rsa.py: for i in range(0, len(ciphertext), key_size_bytes):
    # If len(ciphertext) is artificially extended with a partial block that turns into b""
    # or if range exceeds, but actually if ciphertext has trailing bytes, let's verify range behavior.
    # When ciphertext length is, say, key_size_bytes + 0, range(0, len, key_size_bytes) yields 0.
    # If we pass a ciphertext where block slice is empty or evaluated in the loop:
    # Notice line 97-98: `if not (block := ciphertext[i : i + key_size_bytes]): continue`
    # If i < len(ciphertext), ciphertext[i : i + key_size_bytes] is non-empty unless len(ciphertext) == 0 (range produces nothing).
    # But if ciphertext is modified or sliced such that `ciphertext[i:i+key_size_bytes]` could be empty if `i == len(ciphertext)`,
    # or if ciphertext is a custom byte sequence with an extra range step, e.g. mock range or empty slice.
    # Let's test decrypting empty ciphertext directly:
    decrypted_empty = decrypt(b"", priv_pem)
    assert decrypted_empty == ""

def test_decrypt_ciphertext_with_extra_empty_slice():
    """Specifically test line 98 where `if not (block := ...)` is truthy/falsy."""
    import builtins
    pub_pem, priv_pem = generate_keypair(key_size=512)
    message = "A"
    ciphertext = encrypt(message, pub_pem)

    header = "-----BEGIN RSA PRIVATE KEY-----"
    footer = "-----END RSA PRIVATE KEY-----"
    key_params = _parse_pem(priv_pem, header, footer)
    n = key_params[0]
    key_size_bytes = (n.bit_length() + 7) // 8

    original_range = builtins.range

    def mock_range(*args, **kwargs):
        res = list(original_range(*args, **kwargs))
        if len(args) == 3 and args[1] == len(ciphertext):
            res.append(args[1])
        return res

    with patch("builtins.range", side_effect=mock_range):
        decrypted = decrypt(ciphertext, priv_pem)
        assert decrypted == message

def test_main_execution_module():
    import runpy
    import sys
    with patch.dict(os.environ, clear=True):
        # Temporarily remove methods.modern.rsa from sys.modules so run_module executes __name__ == "__main__"
        sys.modules.pop("methods.modern.rsa", None)
        runpy.run_module("methods.modern.rsa", run_name="__main__")

def test_parse_pem_invalid_payload():
    header = "-----BEGIN RSA PUBLIC KEY-----"
    footer = "-----END RSA PUBLIC KEY-----"
    invalid_pem = b"-----BEGIN RSA PUBLIC KEY-----\nNOT_BASE64_!!!\n-----END RSA PUBLIC KEY-----\n"
    with pytest.raises(Exception):
        _parse_pem(invalid_pem, header, footer)

def test_encrypt_invalid_key_pem():
    invalid_pem = b"-----BEGIN RSA PUBLIC KEY-----\n\n-----END RSA PUBLIC KEY-----\n"
    with pytest.raises(Exception):
        encrypt("Test", invalid_pem)

def test_rsa_encrypt_small_modulus_error():
    from methods.modern.helpers import b64encode
    # Construct a PEM key with small n (e.g., n = 15, e = 3)
    pub_str = "15:3"
    pub_b64 = b64encode(pub_str.encode('utf-8'))
    small_pub_pem = (
        f"-----BEGIN RSA PUBLIC KEY-----\n"
        f"{pub_b64}\n"
        f"-----END RSA PUBLIC KEY-----\n"
    ).encode('utf-8')

    with pytest.raises(ValueError, match="RSA modulus n must be at least 256"):
        encrypt("Test", small_pub_pem)

def test_rsa_decrypt_small_modulus_error():
    from methods.modern.helpers import b64encode
    # Construct a private key PEM with small n (e.g., n = 15, e = 3, d = 3, p = 3, q = 5)
    priv_str = "15:3:3:3:5"
    priv_b64 = b64encode(priv_str.encode('utf-8'))
    small_priv_pem = (
        f"-----BEGIN RSA PRIVATE KEY-----\n"
        f"{priv_b64}\n"
        f"-----END RSA PRIVATE KEY-----\n"
    ).encode('utf-8')

    with pytest.raises(ValueError, match="RSA modulus n must be at least 256"):
        decrypt(b"\x00", small_priv_pem)

def test_parse_pem_missing_header_or_footer():
    """Test that missing PEM header or footer raises ValueError in _parse_pem."""
    header = "-----BEGIN RSA PUBLIC KEY-----"
    footer = "-----END RSA PUBLIC KEY-----"
    err_msg = "Invalid PEM structure: missing required header or footer"
    # Missing footer
    pem_no_footer = b"-----BEGIN RSA PUBLIC KEY-----\nMTIz\n"
    with pytest.raises(ValueError, match=err_msg):
        _parse_pem(pem_no_footer, header, footer)

    # Missing header
    pem_no_header = b"MTIz\n-----END RSA PUBLIC KEY-----\n"
    with pytest.raises(ValueError, match=err_msg):
        _parse_pem(pem_no_header, header, footer)

def test_decrypt_private_key_missing_header_or_footer():
    """Test that missing encrypted PEM header or footer raises ValueError in decrypt_private_key."""
    passphrase = b"testpass"
    enc_err = "Invalid encrypted PEM structure: missing required header or footer"
    pem_no_header = b"SGVsbG8=\n-----END ENCRYPTED RSA PRIVATE KEY-----\n"
    with pytest.raises(ValueError, match=enc_err):
        decrypt_private_key(pem_no_header, passphrase)


def test_parse_pem_single_parameter_or_non_integer():
    """Test that _parse_pem raises ValueError for single parameter or non-integer payloads."""
    from methods.modern.helpers import b64encode
    header = "-----BEGIN RSA PUBLIC KEY-----"
    footer = "-----END RSA PUBLIC KEY-----"

    # Single parameter payload
    single_param_pem = f"{header}\n{b64encode(b'12345')}\n{footer}".encode('utf-8')
    with pytest.raises(
        ValueError,
        match="Invalid PEM payload format: expected colon-separated parameter values"
    ):
        _parse_pem(single_param_pem, header, footer)

    # Non-integer parameter payload
    non_int_pem = f"{header}\n{b64encode(b'12345:abc')}\n{footer}".encode('utf-8')
    with pytest.raises(ValueError, match="Invalid integer parameter in PEM payload"):
        _parse_pem(non_int_pem, header, footer)


def test_decrypt_private_key_payload_too_short():
    """Test that decrypt_private_key raises ValueError when the payload is under 16 bytes."""
    from methods.modern.helpers import b64encode
    header = "-----BEGIN ENCRYPTED RSA PRIVATE KEY-----"
    footer = "-----END ENCRYPTED RSA PRIVATE KEY-----"
    short_pem = f"{header}\n{b64encode(b'short')}\n{footer}".encode('utf-8')
    with pytest.raises(
        ValueError,
        match="Invalid encrypted PEM payload: payload size must be at least 16 bytes"
    ):
        decrypt_private_key(short_pem, b"passphrase")


def test_rsa_input_validation_and_bounds():
    """Test security input type and size bounds checks in RSA functions."""
    pub_pem, priv_pem = generate_keypair(key_size=512)

    # Message type and length limits
    with pytest.raises(TypeError, match="Message must be a string"):
        encrypt(12345, pub_pem)

    with pytest.raises(ValueError, match="Message length exceeds maximum limit"):
        encrypt("A" * 10001, pub_pem)

    # Ciphertext type and length limits
    with pytest.raises(TypeError, match="Ciphertext must be bytes or bytearray"):
        decrypt("not_bytes", priv_pem)

    with pytest.raises(ValueError, match="Ciphertext length exceeds maximum limit"):
        decrypt(b"A" * 100001, priv_pem)

    # PEM data type and UTF-8 / Base64 error handling
    with pytest.raises(TypeError, match="PEM data must be bytes or bytearray"):
        _parse_pem("not_bytes", "-----BEGIN RSA PUBLIC KEY-----", "-----END RSA PUBLIC KEY-----")

    with pytest.raises(ValueError, match="Invalid UTF-8 encoding"):
        _parse_pem(
            b"\x80\x81\x82",
            "-----BEGIN RSA PUBLIC KEY-----",
            "-----END RSA PUBLIC KEY-----",
        )

    # Passphrase & Encrypted PEM type and empty passphrase checks
    with pytest.raises(TypeError, match="Encrypted private key PEM must be bytes or bytearray"):
        decrypt_private_key("not_bytes", b"passphrase")

    with pytest.raises(TypeError, match="Passphrase must be bytes or bytearray"):
        decrypt_private_key(pub_pem, "not_bytes")

    with pytest.raises(ValueError, match="Passphrase cannot be empty"):
        decrypt_private_key(pub_pem, b"")
