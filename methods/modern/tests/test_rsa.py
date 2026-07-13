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

