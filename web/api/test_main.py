from fastapi.testclient import TestClient
from api.main import app

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

def test_affine_encrypt_non_coprime():
    # a_key = 13 (gcd(13, 26) = 13 != 1)
    response = client.post("/api/affine/encrypt", json={"plaintext": "HELLO", "a_key": 13, "b_key": 5})
    assert response.status_code == 400
    assert "coprime" in response.json()["detail"].lower()

def test_affine_encrypt_input_too_long():
    long_text = "a" * 501
    response = client.post("/api/affine/encrypt", json={"plaintext": long_text, "a_key": 5, "b_key": 8})
    assert response.status_code == 400
    assert "exceeds" in response.json()["detail"].lower()


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
    assert response.json()["plaintext"] in ("h e l l o", "h e l l i o")

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

def test_enigma_duplicate_rotors():
    response = client.post("/api/enigma/encipher", json={
        "plaintext": "HELLO",
        "rotors": ["I", "I", "II"],
        "positions": ["A", "A", "A"],
        "rings": ["A", "A", "A"],
        "plugboard": []
    })
    assert response.status_code == 400
    assert "duplicate" in response.json()["detail"].lower()

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



