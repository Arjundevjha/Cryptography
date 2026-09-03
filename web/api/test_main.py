from unittest.mock import patch
import unittest.mock
import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException
from api.main import (
    app,
    validate_enigma_rotors,
    DEFAULT_ALLOWED_ORIGINS,
    is_valid_origin,
    parse_allowed_origins,
)

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_validate_input_success():
    response = client.post("/api/validate", json={"text": "hello"})
    assert response.status_code == 200
    assert response.json() == {"status": "valid", "length": 5}

def test_validate_input_exceeds_limit():
    long_text = "a" * 501
    response = client.post("/api/validate", json={"text": long_text})
    assert response.status_code == 400
    assert "exceeds" in response.json()["detail"].lower()

def test_affine_encrypt_success():
    response = client.post("/api/affine/encrypt", json={"plaintext": "ATTACK", "a_key": 5, "b_key": 8})
    assert response.status_code == 200
    # Note: methods/classical/affine.py converts to lowercase, so it returns "izzisg"
    assert response.json() == {"ciphertext": "izzisg"}

def test_affine_decrypt_success():
    response = client.post("/api/affine/decrypt", json={"ciphertext": "izzisg", "a_key": 5, "b_key": 8})
    assert response.status_code == 200
    assert response.json() == {"plaintext": "attack"}

@pytest.mark.parametrize("a_key", [0, 2, 4, 13, 26, 39, 52, -2, -13])
def test_affine_encrypt_non_coprime(a_key):
    response = client.post("/api/affine/encrypt", json={"plaintext": "HELLO", "a_key": a_key, "b_key": 5})
    assert response.status_code == 400
    assert "coprime" in response.json()["detail"].lower()

def test_affine_encrypt_input_too_long():
    long_text = "a" * 501
    response = client.post("/api/affine/encrypt", json={"plaintext": long_text, "a_key": 5, "b_key": 8})
    assert response.status_code == 400
    assert "exceeds" in response.json()["detail"].lower()

@pytest.mark.parametrize("a_key", [0, 2, 4, 13, 26, 39, 52, -2, -13])
def test_affine_decrypt_non_coprime(a_key):
    response = client.post("/api/affine/decrypt", json={"ciphertext": "HELLO", "a_key": a_key, "b_key": 5})
    assert response.status_code == 400
    assert "coprime" in response.json()["detail"].lower()

@patch("api.main.affine.encrypt")
def test_affine_encrypt_internal_error(mock_encrypt, caplog):
    mock_encrypt.side_effect = RuntimeError("Test internal error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/affine/encrypt", json={"plaintext": "HELLO", "a_key": 5, "b_key": 8})
    assert response.status_code == 400
    assert response.json() == {"detail": "Encryption failed"}
    assert "Affine encryption error" in caplog.text

@patch("api.main.affine.decrypt")
def test_affine_decrypt_internal_error(mock_decrypt, caplog):
    mock_decrypt.side_effect = RuntimeError("Test internal error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/affine/decrypt", json={"ciphertext": "HELLO", "a_key": 5, "b_key": 8})
    assert response.status_code == 400
    assert response.json() == {"detail": "Decryption failed"}
    assert "Affine decryption error" in caplog.text



# ==========================================
# SCYTALE TESTS
# ==========================================

def test_scytale_encrypt_success():
    response = client.post("/api/scytale/encrypt", json={"plaintext": "I AM HURT VERY BADLY", "width": 4})
    assert response.status_code == 200
    assert response.json() == {"ciphertext": "I TRA H YDAUV LMREBY"}

def test_scytale_decrypt_success():
    response = client.post("/api/scytale/decrypt", json={"ciphertext": "I TRA H YDAUV LMREBY", "width": 4})
    assert response.status_code == 200
    assert response.json()["plaintext"].startswith("I AM HURT VERY BADLY")

def test_scytale_encrypt_invalid_width():
    response = client.post("/api/scytale/encrypt", json={"plaintext": "HELLO", "width": 1})
    assert response.status_code == 400
    assert "width" in response.json()["detail"].lower()


# ==========================================
# POLYBIUS TESTS
# ==========================================

def test_polybius_encrypt_success():
    response = client.post("/api/polybius/encrypt", json={"plaintext": "HELLO"})
    assert response.status_code == 200
    assert response.json() == {"ciphertext": "23 15 31 31 34"}

def test_polybius_decrypt_success():
    response = client.post("/api/polybius/decrypt", json={"ciphertext": "23 15 31 31 34"})
    assert response.status_code == 200
    # Decrypt standard is HELLIO or HELLO (since i and j merge)
    assert response.json()["plaintext"] in ("HELLO", "HELLIO")

def test_polybius_decrypt_invalid_coordinates():
    response = client.post("/api/polybius/decrypt", json={"ciphertext": "23 15 31 3"})
    assert response.status_code == 400
    assert "pairs" in response.json()["detail"].lower()

def test_polybius_decrypt_out_of_range():
    response = client.post("/api/polybius/decrypt", json={"ciphertext": "23 99 31"})
    assert response.status_code == 400
    assert "between 1 and 5" in response.json()["detail"].lower()

def test_polybius_decrypt_non_numeric():
    response = client.post("/api/polybius/decrypt", json={"ciphertext": "2a 15 31"})
    assert response.status_code == 400
    assert "pairs" in response.json()["detail"].lower()


# ==========================================
# ENIGMA TESTS
# ==========================================

def test_enigma_encipher_success():
    response = client.post("/api/enigma/encipher", json={
        "plaintext": "HELLO",
        "rotors": ["I", "II", "III"],
        "positions": ["A", "A", "A"],
        "rings": ["A", "A", "A"],
        "plugboard": []
    })
    assert response.status_code == 200
    assert response.json()["ciphertext"] != ""

def test_enigma_reciprocity():
    response = client.post("/api/enigma/encipher", json={
        "plaintext": "HELLO",
        "rotors": ["I", "II", "III"],
        "positions": ["A", "A", "A"],
        "rings": ["A", "A", "A"],
        "plugboard": ["AB", "CD"]
    })
    assert response.status_code == 200
    ciphertext = response.json()["ciphertext"]

    response2 = client.post("/api/enigma/encipher", json={
        "plaintext": ciphertext,
        "rotors": ["I", "II", "III"],
        "positions": ["A", "A", "A"],
        "rings": ["A", "A", "A"],
        "plugboard": ["AB", "CD"]
    })
    assert response2.status_code == 200
    assert response2.json()["ciphertext"] == "HELLO"

@pytest.mark.parametrize("rotors", [
    ["I", "II", "III"],
    ["IV", "V", "VI"],
    ["VII", "VIII", "I"],
    ["II", "IV", "VIII"],
])
def test_validate_enigma_rotors_valid(rotors):
    validate_enigma_rotors(rotors)

@pytest.mark.parametrize("rotors", [
    [],
    ["I"],
    ["I", "II"],
    ["I", "II", "III", "IV"],
])
def test_validate_enigma_rotors_invalid_count(rotors):
    with pytest.raises(HTTPException) as exc_info:
        validate_enigma_rotors(rotors)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Exactly 3 rotors must be specified."

@pytest.mark.parametrize("rotors", [
    ["I", "I", "II"],
    ["I", "I", "I"],
    ["V", "III", "V"],
    ["VIII", "VIII", "I"],
])
def test_validate_enigma_rotors_duplicate_rotors(rotors):
    with pytest.raises(HTTPException) as exc_info:
        validate_enigma_rotors(rotors)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Duplicate rotors are not allowed."

@pytest.mark.parametrize("rotors,invalid_rotor", [
    (["i", "II", "III"], "i"),
    (["IX", "II", "III"], "IX"),
    (["I", "X", "III"], "X"),
    (["INVALID", "II", "III"], "INVALID"),
    (["1", "2", "3"], "1"),
    (["", "II", "III"], ""),
])
def test_validate_enigma_rotors_invalid_rotor_type(rotors, invalid_rotor):
    with pytest.raises(HTTPException) as exc_info:
        validate_enigma_rotors(rotors)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == f"Invalid rotor '{invalid_rotor}'."

@pytest.mark.parametrize("rotors,expected_error", [
    (["I", "II"], "exactly 3 rotors"),
    (["I", "I", "II"], "duplicate rotors"),
    (["INVALID", "II", "III"], "invalid rotor"),
])
def test_enigma_api_rotors_validation(rotors, expected_error):
    response = client.post("/api/enigma/encipher", json={
        "plaintext": "HELLO",
        "rotors": rotors,
        "positions": ["A", "A", "A"],
        "rings": ["A", "A", "A"],
        "plugboard": []
    })
    assert response.status_code == 400
    assert expected_error in response.json()["detail"].lower()

def test_enigma_invalid_plugboard_character():
    response = client.post("/api/enigma/encipher", json={
        "plaintext": "HELLO",
        "rotors": ["I", "II", "III"],
        "positions": ["A", "A", "A"],
        "rings": ["A", "A", "A"],
        "plugboard": ["A1", "CD"]
    })
    assert response.status_code == 400
    assert "format" in response.json()["detail"].lower()

def test_enigma_duplicate_plugboard_connection():
    response = client.post("/api/enigma/encipher", json={
        "plaintext": "HELLO",
        "rotors": ["I", "II", "III"],
        "positions": ["A", "A", "A"],
        "rings": ["A", "A", "A"],
        "plugboard": ["AB", "AC"]
    })
    assert response.status_code == 400
    assert "duplicate" in response.json()["detail"].lower()


def test_enigma_encipher_with_reflectors():
    for ref in ["A", "B", "C", "B_THIN", "C_THIN"]:
        response = client.post("/api/enigma/encipher", json={
            "plaintext": "HELLO",
            "rotors": ["I", "II", "III"],
            "positions": ["A", "A", "A"],
            "rings": ["A", "A", "A"],
            "reflector": ref,
            "plugboard": ["AB", "CD"]
        })
        assert response.status_code == 200
        assert "ciphertext" in response.json()
        assert len(response.json()["ciphertext"]) == 5


# ==========================================
# MODERN CIPHER TESTS
# ==========================================

def test_aes_encrypt_decrypt_16_byte_key():
    # Test AES-128 (16-byte key)
    payload = {
        "plaintext": "Secret Message",
        "key": "1234567890123456",
        "key_format": "text",
        "plaintext_format": "text"
    }
    response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "ciphertext" in data
    assert "nonce" in data

    # Decrypt
    decrypt_payload = {
        "ciphertext": data["ciphertext"],
        "key": "1234567890123456",
        "nonce": data["nonce"],
        "key_format": "text"
    }
    dec_response = client.post("/api/aes/decrypt", json=decrypt_payload)
    assert dec_response.status_code == 200
    assert dec_response.json() == {"plaintext": "Secret Message"}

def test_aes_encrypt_decrypt_32_byte_key():
    # Test AES-256 (32-byte key)
    payload = {
        "plaintext": "Secret Message",
        "key": "12345678901234561234567890123456",
        "key_format": "text",
        "plaintext_format": "text"
    }
    response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Decrypt
    decrypt_payload = {
        "ciphertext": data["ciphertext"],
        "key": "12345678901234561234567890123456",
        "nonce": data["nonce"],
        "key_format": "text"
    }
    dec_response = client.post("/api/aes/decrypt", json=decrypt_payload)
    assert dec_response.status_code == 200
    assert dec_response.json() == {"plaintext": "Secret Message"}

def test_aes_encrypt_hex_plaintext():
    # "Secret" in hex is "536563726574"
    payload = {
        "plaintext": "536563726574",
        "key": "1234567890123456",
        "key_format": "text",
        "plaintext_format": "hex"
    }
    response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Decrypt
    decrypt_payload = {
        "ciphertext": data["ciphertext"],
        "key": "1234567890123456",
        "nonce": data["nonce"],
        "key_format": "text"
    }
    dec_response = client.post("/api/aes/decrypt", json=decrypt_payload)
    assert dec_response.status_code == 200
    assert dec_response.json() == {"plaintext": "Secret"}

def test_aes_invalid_key_size():
    payload = {
        "plaintext": "Secret Message",
        "key": "12345",
        "key_format": "text",
        "plaintext_format": "text"
    }
    response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 400
    assert "key must be 16 or 32 bytes" in response.json()["detail"].lower()

def test_aes_invalid_hex_key():
    payload = {
        "plaintext": "Secret Message",
        "key": "GHIJKL",
        "key_format": "hex",
        "plaintext_format": "text"
    }
    response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 400
    assert "invalid hex" in response.json()["detail"].lower()

def test_aes_invalid_key_format():
    payload = {
        "plaintext": "Secret Message",
        "key": "1234567890123456",
        "key_format": "binary",
        "plaintext_format": "text"
    }
    response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 400
    assert "invalid key format" in response.json()["detail"].lower()

def test_aes_invalid_plaintext_format():
    payload = {
        "plaintext": "Secret Message",
        "key": "1234567890123456",
        "key_format": "text",
        "plaintext_format": "invalid"
    }
    response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 400
    assert "invalid plaintext format" in response.json()["detail"].lower()

def test_aes_decrypt_invalid_hex_ciphertext():
    payload = {
        "ciphertext": "InvalidHexFormat!",
        "key": "1234567890123456",
        "nonce": "123456789012345678901234",
        "key_format": "text"
    }
    response = client.post("/api/aes/decrypt", json=payload)
    assert response.status_code == 400
    assert "hex" in response.json()["detail"].lower()

def test_rsa_keygen_success():
    payload = {
        "p": 61,
        "q": 53,
        "e": 17
    }
    response = client.post("/api/rsa/keygen", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["n"] == 61 * 53
    assert data["phi"] == 60 * 52
    assert "public_key" in data
    assert "private_key" in data

def test_rsa_keygen_non_prime():
    payload = {
        "p": 4,
        "q": 53,
        "e": 17
    }
    response = client.post("/api/rsa/keygen", json=payload)
    assert response.status_code == 400
    assert "prime" in response.json()["detail"].lower()

def test_rsa_keygen_too_small():
    payload = {
        "p": 2,
        "q": 3,
        "e": 65537
    }
    response = client.post("/api/rsa/keygen", json=payload)
    assert response.status_code == 400
    assert "greater than 2" in response.json()["detail"].lower()

def test_rsa_keygen_non_coprime():
    # phi(61, 53) = 3120. e=13 is not coprime to 3120 (13 * 240 = 3120)
    payload = {
        "p": 61,
        "q": 53,
        "e": 13
    }
    response = client.post("/api/rsa/keygen", json=payload)
    assert response.status_code == 400
    assert "coprime" in response.json()["detail"].lower()

def test_rsa_encrypt_decrypt_success():
    # Generate keys
    keygen_resp = client.post("/api/rsa/keygen", json={"p": 61, "q": 53, "e": 17})
    assert keygen_resp.status_code == 200
    keys = keygen_resp.json()

    # Encrypt
    enc_payload = {
        "plaintext": "42",
        "public_key": keys["public_key"]
    }
    enc_resp = client.post("/api/rsa/encrypt", json=enc_payload)
    assert enc_resp.status_code == 200
    enc_data = enc_resp.json()
    assert "ciphertext" in enc_data

    # Decrypt
    dec_payload = {
        "ciphertext": enc_data["ciphertext"],
        "private_key": keys["private_key"]
    }
    dec_resp = client.post("/api/rsa/decrypt", json=dec_payload)
    assert dec_resp.status_code == 200
    assert dec_resp.json() == {"plaintext": "42"}

def test_sha256_empty_string():
    response = client.post("/api/sha256", json={"plaintext": ""})
    assert response.status_code == 200
    assert response.json() == {"hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}

def test_sha256_text():
    response = client.post("/api/sha256", json={"plaintext": "hello"})
    assert response.status_code == 200
    assert response.json() == {"hash": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"}

def test_rsa_encrypt_exception(caplog):
    enc_payload = {
        "plaintext": "Secret Message",
        "public_key": "dummy_public_key"
    }
    with patch("methods.modern.rsa.encrypt", side_effect=Exception("Test mock exception")):
        with caplog.at_level("ERROR"):
            response = client.post("/api/rsa/encrypt", json=enc_payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Encryption failed"
    assert "RSA encryption error" in caplog.text

def test_rsa_decrypt_exception(caplog):
    dec_payload = {
        "ciphertext": "00",
        "private_key": "dummy_private_key"
    }
    with patch("methods.modern.rsa.decrypt", side_effect=Exception("Test mock exception")):
        with caplog.at_level("ERROR"):
            response = client.post("/api/rsa/decrypt", json=dec_payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Decryption failed"
    assert "RSA decryption error" in caplog.text

def test_aes_decrypt_exception(caplog):
    payload = {
        "ciphertext": "00112233",
        "key": "1234567890123456",
        "nonce": "aabbccdd",
        "key_format": "text"
    }
    with patch("methods.modern.aes.decrypt", side_effect=Exception("Mocked decryption error")):
        with caplog.at_level("ERROR"):
            response = client.post("/api/aes/decrypt", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Decryption failed"
    assert "AES decryption error" in caplog.text

def test_sha256_exception(caplog):
    payload = {"plaintext": "hello"}
    with patch("methods.modern.hash_functions.sha256", side_effect=Exception("Mocked SHA256 error")):
        with caplog.at_level("ERROR"):
            response = client.post("/api/sha256", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Hashing failed"
    assert "SHA256 error" in caplog.text

def test_aes_decrypt_invalid_hex_logging(caplog):
    payload = {
        "ciphertext": "InvalidHex!",
        "key": "1234567890123456",
        "nonce": "aabbccdd",
        "key_format": "text"
    }
    with caplog.at_level("WARNING"):
        response = client.post("/api/aes/decrypt", json=payload)
    assert response.status_code == 400
    assert "Ciphertext and nonce must be valid hex strings" in response.json()["detail"]
    assert "Invalid hex ciphertext or nonce in AES decrypt" in caplog.text

def test_aes_encrypt_exception(caplog):
    payload = {
        "plaintext": "Secret Message",
        "key": "1234567890123456",
        "key_format": "text",
        "plaintext_format": "text"
    }
    with patch("methods.modern.aes.encrypt", side_effect=Exception("Mocked AES encryption error")):
        with caplog.at_level("ERROR"):
            response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Encryption failed"
    assert "AES encryption error" in caplog.text

def test_caesar_encrypt_decrypt_success():
    enc = client.post("/api/caesar/encrypt", json={"plaintext": "HELLO", "shift": 3})
    assert enc.status_code == 200
    assert enc.json() == {"ciphertext": "KHOOR"}
    dec = client.post("/api/caesar/decrypt", json={"ciphertext": "KHOOR", "shift": 3})
    assert dec.status_code == 200
    assert dec.json() == {"plaintext": "HELLO"}

def test_vigenere_encrypt_decrypt_success():
    enc = client.post("/api/vigenere/encrypt", json={"plaintext": "ATTACKATDAWN", "key": "LEMON"})
    assert enc.status_code == 200
    assert "ciphertext" in enc.json()
    ciphertext = enc.json()["ciphertext"]
    dec = client.post("/api/vigenere/decrypt", json={"ciphertext": ciphertext, "key": "LEMON"})
    assert dec.status_code == 200
    assert dec.json() == {"plaintext": "ATTACKATDAWN"}

def test_vigenere_empty_key():
    resp = client.post("/api/vigenere/encrypt", json={"plaintext": "HELLO", "key": ""})
    assert resp.status_code == 400
    assert "cannot be empty" in resp.json()["detail"].lower()

def test_playfair_encrypt_decrypt_success():
    enc = client.post("/api/playfair/encrypt", json={"plaintext": "INSTRUMENT", "key": "MONARCHY"})
    assert enc.status_code == 200
    assert "ciphertext" in enc.json()
    ciphertext = enc.json()["ciphertext"]
    dec = client.post("/api/playfair/decrypt", json={"ciphertext": ciphertext, "key": "MONARCHY"})
    assert dec.status_code == 200
    assert "plaintext" in dec.json()

def test_playfair_empty_key():
    resp = client.post("/api/playfair/encrypt", json={"plaintext": "HELLO", "key": ""})
    assert resp.status_code == 400
    assert "cannot be empty" in resp.json()["detail"].lower()


# ==========================================
# LORENZ TESTS
# ==========================================

def test_lorenz_api_encrypt_decrypt_success():
    enc = client.post("/api/lorenz/encrypt", json={"plaintext": "HELLOLORENZ"})
    assert enc.status_code == 200
    ciphertext = enc.json()["ciphertext"]

    dec = client.post("/api/lorenz/decrypt", json={"ciphertext": ciphertext})
    assert dec.status_code == 200
    assert dec.json()["plaintext"] == "HELLOLORENZ"


def test_lorenz_api_custom_positions():
    positions = [1] * 12
    enc = client.post("/api/lorenz/encrypt", json={"plaintext": "TOPSECRET", "positions": positions})
    assert enc.status_code == 200
    ciphertext = enc.json()["ciphertext"]

    dec = client.post("/api/lorenz/decrypt", json={"ciphertext": ciphertext, "positions": positions})
    assert dec.status_code == 200
    assert dec.json()["plaintext"] == "TOPSECRET"


def test_lorenz_api_invalid_positions():
    positions = [1, 2]  # Should be 12 items
    enc = client.post("/api/lorenz/encrypt", json={"plaintext": "TOPSECRET", "positions": positions})
    assert enc.status_code == 400
    assert "encryption failed" in enc.json()["detail"].lower()

    dec = client.post("/api/lorenz/decrypt", json={"ciphertext": "TOPSECRET", "positions": positions})
    assert dec.status_code == 400
    assert "decryption failed" in dec.json()["detail"].lower()


def test_lorenz_api_invalid_pins():
    # Chi pins requires 5 arrays
    chi_pins = [[1, 0] * 20]
    enc = client.post("/api/lorenz/encrypt", json={"plaintext": "TEST", "chi_pins": chi_pins})
    assert enc.status_code == 400
    assert "encryption failed" in enc.json()["detail"].lower()


def test_lorenz_api_runtime_error_exception(caplog):
    with patch("methods.historical.lorenz.Lorenz.encrypt_text", side_effect=RuntimeError("Test Lorenz RuntimeError")):
        with caplog.at_level("ERROR"):
            resp = client.post("/api/lorenz/encrypt", json={"plaintext": "HELLO"})
        assert resp.status_code == 400
        assert resp.json() == {"detail": "Encryption failed"}
        assert "Lorenz encryption error" in caplog.text


def test_enigma_api_runtime_error_exception(caplog):
    with patch("methods.historical.enigma.enigma.Enigma.encipher", side_effect=RuntimeError("Test Enigma RuntimeError")):
        with caplog.at_level("ERROR"):
            resp = client.post("/api/enigma/encipher", json={
                "plaintext": "HELLO",
                "rotors": ["I", "II", "III"],
                "positions": ["A", "A", "A"],
                "rings": ["A", "A", "A"],
                "plugboard": []
            })
        assert resp.status_code == 400
        assert resp.json() == {"detail": "Encryption failed"}
        assert "Enigma encryption error" in caplog.text


# ==========================================
# CORS ORIGIN VALIDATION TESTS
# ==========================================

@pytest.mark.parametrize("origin", [
    "http://localhost:3000",
    "http://localhost:3000/",
    "https://example.com",
    "https://sub.domain.example.com:8443",
    "http://127.0.0.1:8080",
    "http://192.168.1.1",
    "https://[::1]:8080",
    "  http://example.com  ",
])
def test_is_valid_origin_valid_cases(origin):
    assert is_valid_origin(origin) is True

@pytest.mark.parametrize("origin", [
    "*",
    "http://*",
    "https://*.example.com",
    "ftp://example.com",
    "ws://example.com",
    "wss://example.com",
    "javascript:alert(1)",
    "http://example.com/path",
    "http://example.com?query=1",
    "http://example.com#fragment",
    "http://example.com;matrix=1",
    "http://",
    "https://",
    "http://example.com:badport",
    "http://example com",
    "http://example\tcom",
    "http://example\ncom",
    "http://example\rcom",
    'http://example"com',
    "http://example'com",
    "http://example<com",
    "http://example>com",
    "",
    "   ",
    None,
    123,
    [],
    {},
    True,
    "http://[:::1]",
])
def test_is_valid_origin_invalid_cases(origin):
    assert is_valid_origin(origin) is False

def test_is_valid_origin_exception_handling():
    with unittest.mock.patch("api.main.urlparse", side_effect=ValueError("Parse failed")):
        assert is_valid_origin("https://example.com") is False

def test_is_valid_origin_unexpected_exception(caplog):
    with unittest.mock.patch("api.main.urlparse", side_effect=RuntimeError("Unexpected urlparse error")):
        with caplog.at_level("WARNING"):
            assert is_valid_origin("http://localhost:3000") is False
    assert "Unexpected error validating origin" in caplog.text

def test_parse_allowed_origins():
    # Unset or empty env string falls back to default allowed origins
    assert parse_allowed_origins(None) == DEFAULT_ALLOWED_ORIGINS
    assert parse_allowed_origins("") == DEFAULT_ALLOWED_ORIGINS
    assert parse_allowed_origins("   ") == DEFAULT_ALLOWED_ORIGINS

    # Valid origins list
    env_input = "http://localhost:3000, https://app.example.com"
    assert parse_allowed_origins(env_input) == ["http://localhost:3000", "https://app.example.com"]

    # Trailing slashes stripped and deduplicated
    env_input = "http://localhost:3000/, http://localhost:3000"
    assert parse_allowed_origins(env_input) == ["http://localhost:3000"]

    # Filtering out wildcards, invalid schemes, and paths
    env_input = "*, http://*, https://valid.org, ftp://bad.com, https://domain.com/path"
    assert parse_allowed_origins(env_input) == ["https://valid.org"]

    # All invalid inputs fall back to default allowed origins
    assert parse_allowed_origins("*, http://*, ftp://bad.org") == DEFAULT_ALLOWED_ORIGINS


# ==========================================
# INPUT BOUNDS & DOS MITIGATION TESTS
# ==========================================

def test_rsa_keygen_excessive_prime_bound():
    payload = {
        "p": 2**2048 + 1,
        "q": 53,
        "e": 17
    }
    response = client.post("/api/rsa/keygen", json=payload)
    assert response.status_code == 400

def test_enigma_encipher_oversized_plugboard():
    payload = {
        "plaintext": "HELLO",
        "rotors": ["I", "II", "III"],
        "positions": ["A", "A", "A"],
        "rings": ["A", "A", "A"],
        "plugboard": ["AB"] * 15
    }
    response = client.post("/api/enigma/encipher", json=payload)
    assert response.status_code == 400

def test_lorenz_encrypt_oversized_positions():
    payload = {
        "plaintext": "HELLO",
        "positions": [1] * 15
    }
    response = client.post("/api/lorenz/encrypt", json=payload)
    assert response.status_code == 400

def test_scytale_encrypt_excessive_width():
    payload = {
        "plaintext": "HELLO",
        "width": 10001
    }
    response = client.post("/api/scytale/encrypt", json=payload)
    assert response.status_code == 400






