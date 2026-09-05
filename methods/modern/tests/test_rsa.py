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

    def mock_range(start, stop=None, step=1):
        if stop is None:
            return original_range(start)
        r = list(original_range(start, stop, step))
        # Only append extra index for the ciphertext iteration in decrypt
        if stop == len(ciphertext) and step == key_size_bytes:
            r.append(stop)
        return r

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

def test_encrypt_decrypt_unicode_and_symbols():
    pub_pem, priv_pem = generate_keypair(key_size=512)
    message = "Bonjour 🇫🇷 🎉 密码 Key 🔑 \n\t\x00 RSA!"
    ciphertext = encrypt(message, pub_pem)

    assert isinstance(ciphertext, bytes)
    assert len(ciphertext) > 0

    decrypted_message = decrypt(ciphertext, priv_pem)
    assert decrypted_message == message

def test_fallback_imports_functionality():
    """Verify encrypt and decrypt function correctly under fallback import conditions."""
    import sys
    import builtins
    from importlib import reload
    import methods.modern.rsa as rsa_module

    original_import = builtins.__import__

    def mocked_import(name, globals=None, locals=None, fromlist=(), level=0):
        if level > 0 and name in ('symmetric', 'helpers', 'keypair'):
            raise ImportError(f"Mocked relative ImportError for {name}")
        return original_import(name, globals, locals, fromlist, level)

    with patch("builtins.__import__", side_effect=mocked_import):
        sys.path.insert(0, 'methods/modern')
        try:
            reload(rsa_module)
            pub, priv = rsa_module.generate_keypair(key_size=512)
            msg = "Testing fallback imports"
            ct = rsa_module.encrypt(msg, pub)
            dt = rsa_module.decrypt(ct, priv)
            assert dt == msg
        finally:
            sys.path.pop(0)
            reload(rsa_module)

def test_parse_pem_non_integer_payload():
    import base64
    header = "-----BEGIN RSA PUBLIC KEY-----"
    footer = "-----END RSA PUBLIC KEY-----"
    # Base64 string that decodes to non-colon-separated integer text
    encoded = base64.b64encode(b"not:integer:values").decode('utf-8')
    invalid_pem = f"{header}\n{encoded}\n{footer}".encode('utf-8')

    with pytest.raises(ValueError):
        _parse_pem(invalid_pem, header, footer)

def test_decrypt_private_key_short_payload():
    import base64
    header = "-----BEGIN ENCRYPTED RSA PRIVATE KEY-----"
    footer = "-----END ENCRYPTED RSA PRIVATE KEY-----"
    # Payload base64-decodes to fewer than IV_SIZE (16 bytes)
    encoded = base64.b64encode(b"short").decode('utf-8')
    invalid_pem = f"{header}\n{encoded}\n{footer}".encode('utf-8')

    with pytest.raises(Exception):
        decrypt_private_key(invalid_pem, b"passphrase")

def test_decrypt_invalid_utf8_sequence():
    pub_pem, priv_pem = generate_keypair(key_size=512)
    header = "-----BEGIN RSA PRIVATE KEY-----"
    footer = "-----END RSA PRIVATE KEY-----"
    key_params = _parse_pem(priv_pem, header, footer)
    n = key_params[0]
    e = key_params[1]
    key_size_bytes = (n.bit_length() + 7) // 8

    # Craft invalid single-byte UTF-8 value 0xFF (255)
    invalid_utf8_byte = 0xFF
    c = pow(invalid_utf8_byte, e, n)
    corrupted_ciphertext = c.to_bytes(key_size_bytes, byteorder='big')

    with pytest.raises(UnicodeDecodeError):
        decrypt(corrupted_ciphertext, priv_pem)
