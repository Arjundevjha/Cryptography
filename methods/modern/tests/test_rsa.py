import pytest
from methods.modern.keypair import generate_keypair, generate_encrypted_keypair
from methods.modern.rsa import encrypt, decrypt, decrypt_private_key, _parse_pem

def test_rsa_encrypt_decrypt_standard():
    message = "Secret Message 123!"
    public_key, private_key = generate_keypair(key_size=512)

    ciphertext = encrypt(message, public_key)
    assert isinstance(ciphertext, bytes)
    assert ciphertext != message.encode('utf-8')

    decrypted_message = decrypt(ciphertext, private_key)
    assert decrypted_message == message

def test_rsa_decrypt_private_key():
    passphrase = b"super_secure_passphrase"
    public_key, enc_private_key = generate_encrypted_keypair(passphrase, key_size=512)

    # Decrypt the private key
    decrypted_private_key = decrypt_private_key(enc_private_key, passphrase)

    # Check that the decrypted private key is correctly formatted
    assert decrypted_private_key.startswith(b"-----BEGIN RSA PRIVATE KEY-----")
    assert b"-----END RSA PRIVATE KEY-----" in decrypted_private_key

    # Verify that the decrypted private key can be used to decrypt a message
    message = "Another secret message."
    ciphertext = encrypt(message, public_key)

    decrypted_message = decrypt(ciphertext, decrypted_private_key)
    assert decrypted_message == message

def test_parse_pem():
    public_key, _ = generate_keypair(key_size=512)
    key_params = _parse_pem(
        public_key,
        "-----BEGIN RSA PUBLIC KEY-----",
        "-----END RSA PUBLIC KEY-----"
    )
    assert len(key_params) == 2
    assert isinstance(key_params[0], int)
    assert isinstance(key_params[1], int)

def test_main_function(capsys, monkeypatch):
    from methods.modern.rsa import main
    monkeypatch.setenv("RSA_PASSPHRASE", "test_passphrase")
    main()
    captured = capsys.readouterr()
    assert "--- Testing Unencrypted Keypair ---" in captured.out
    assert "Decrypted message: Secret message for RSA" in captured.out
    assert "--- Testing Encrypted Keypair ---" in captured.out
    assert "Decrypted message (with encrypted key): Secret message for RSA" in captured.out

def test_main_function_no_env(capsys, monkeypatch):
    from methods.modern.rsa import main
    monkeypatch.delenv("RSA_PASSPHRASE", raising=False)
    main()
    captured = capsys.readouterr()
    assert "--- Skipping Encrypted Keypair Test ---" in captured.out
    assert "To run the encrypted keypair test, set the RSA_PASSPHRASE environment variable." in captured.out

def test_rsa_decrypt_private_key_wrong_passphrase():
    passphrase = b"correct_passphrase"
    public_key, enc_private_key = generate_encrypted_keypair(passphrase, key_size=512)

    wrong_passphrase = b"wrong_passphrase"

    with pytest.raises(Exception):
        # We expect some exception, most likely a ValueError from incorrect padding,
        # or UnicodeDecodeError due to garbage bytes when attempting to decode the PEM
        decrypt_private_key(enc_private_key, wrong_passphrase)

def test_rsa_encrypt_empty_string():
    public_key, private_key = generate_keypair(key_size=512)
    ciphertext = encrypt("", public_key)
    assert ciphertext == b""
    decrypted = decrypt(ciphertext, private_key)
    assert decrypted == ""
