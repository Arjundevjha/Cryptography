from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException
from api.main import (
    app,
    validate_enigma_rotors,
    parse_enigma_positions,
    parse_and_validate_enigma_rings,
    validate_enigma_plugboard,
    get_enigma_reflector_wiring,
    DEFAULT_ALLOWED_ORIGINS,
    is_valid_origin,
    parse_allowed_origins,
    parse_aes_key,
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

def test_scytale_decrypt_invalid_width():
    response = client.post("/api/scytale/decrypt", json={"ciphertext": "HELLO", "width": 1})
    assert response.status_code == 400
    assert "width" in response.json()["detail"].lower()

@patch("methods.historical.scytale.encrypt", side_effect=ValueError("Scytale val error"))
def test_scytale_encrypt_value_error(mock_enc):
    response = client.post("/api/scytale/encrypt", json={"plaintext": "HELLO", "width": 4})
    assert response.status_code == 400
    assert response.json()["detail"] == "Scytale val error"

@patch("methods.historical.scytale.encrypt", side_effect=Exception("Scytale error"))
def test_scytale_encrypt_exception(mock_enc, caplog):
    with caplog.at_level("ERROR"):
        response = client.post("/api/scytale/encrypt", json={"plaintext": "HELLO", "width": 4})
    assert response.status_code == 400
    assert response.json()["detail"] == "Encryption failed"
    assert "Scytale encryption error" in caplog.text

@patch("methods.historical.scytale.decrypt", side_effect=ValueError("Scytale dec val error"))
def test_scytale_decrypt_value_error(mock_dec):
    response = client.post("/api/scytale/decrypt", json={"ciphertext": "HELLO", "width": 4})
    assert response.status_code == 400
    assert response.json()["detail"] == "Scytale dec val error"

@patch("methods.historical.scytale.decrypt", side_effect=Exception("Scytale dec error"))
def test_scytale_decrypt_exception(mock_dec, caplog):
    with caplog.at_level("ERROR"):
        response = client.post("/api/scytale/decrypt", json={"ciphertext": "HELLO", "width": 4})
    assert response.status_code == 400
    assert response.json()["detail"] == "Decryption failed"
    assert "Scytale decryption error" in caplog.text


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

def test_polybius_encrypt_invalid_key():
    response = client.post("/api/polybius/encrypt", json={"plaintext": "HELLO", "key": "short"})
    assert response.status_code == 400
    assert "25 unique letters" in response.json()["detail"].lower()

def test_polybius_decrypt_invalid_key():
    response = client.post("/api/polybius/decrypt", json={"ciphertext": "23 15", "key": "short"})
    assert response.status_code == 400
    assert "25 unique letters" in response.json()["detail"].lower()

@patch("methods.historical.polybius.encrypt", side_effect=ValueError("Polybius val error"))
def test_polybius_encrypt_value_error(mock_enc):
    response = client.post("/api/polybius/encrypt", json={"plaintext": "HELLO"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Polybius val error"

@patch("methods.historical.polybius.encrypt", side_effect=Exception("Polybius error"))
def test_polybius_encrypt_exception(mock_enc, caplog):
    with caplog.at_level("ERROR"):
        response = client.post("/api/polybius/encrypt", json={"plaintext": "HELLO"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Encryption failed"
    assert "Polybius encryption error" in caplog.text

@patch("methods.historical.polybius.decrypt", side_effect=ValueError("Polybius dec val error"))
def test_polybius_decrypt_value_error(mock_dec):
    response = client.post("/api/polybius/decrypt", json={"ciphertext": "23 15"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Polybius dec val error"

@patch("methods.historical.polybius.decrypt", side_effect=Exception("Polybius dec error"))
def test_polybius_decrypt_exception(mock_dec, caplog):
    with caplog.at_level("ERROR"):
        response = client.post("/api/polybius/decrypt", json={"ciphertext": "23 15"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Decryption failed"
    assert "Polybius decryption error" in caplog.text


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
    ["VIII", "VII", "VI"],
    ["III", "I", "V"],
    ["VI", "IV", "II"],
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
    ([" I ", "II", "III"], " I "),
    (["I", " II", "III"], " II"),
    (["I", "II", "III "], "III "),
    (["I!", "II", "III"], "I!"),
    (["B", "II", "III"], "B"),
    (["0", "II", "III"], "0"),
])
def test_validate_enigma_rotors_invalid_rotor_type(rotors, invalid_rotor):
    with pytest.raises(HTTPException) as exc_info:
        validate_enigma_rotors(rotors)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == f"Invalid rotor '{invalid_rotor}'."

def test_validate_enigma_rotors_error_precedence():
    # 1. Count check priority over duplicates
    with pytest.raises(HTTPException) as exc_info:
        validate_enigma_rotors(["I", "I"])
    assert exc_info.value.detail == "Exactly 3 rotors must be specified."

    # 2. Count check priority over invalid rotor
    with pytest.raises(HTTPException) as exc_info:
        validate_enigma_rotors(["INVALID"])
    assert exc_info.value.detail == "Exactly 3 rotors must be specified."

    # 3. Duplicate check priority over invalid rotor type
    with pytest.raises(HTTPException) as exc_info:
        validate_enigma_rotors(["INVALID", "INVALID", "I"])
    assert exc_info.value.detail == "Duplicate rotors are not allowed."

@pytest.mark.parametrize("rotors,expected_error", [
    (["I", "II"], "exactly 3 rotors"),
    (["I", "I", "II"], "duplicate rotors"),
    (["INVALID", "II", "III"], "invalid rotor"),
    (["i", "ii", "iii"], "invalid rotor 'i'"),
    (["I ", "II", "III"], "invalid rotor 'i '"),
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


# ==========================================
# ENIGMA HELPER VALIDATION UNIT TESTS
# ==========================================

def test_parse_enigma_positions_valid():
    assert parse_enigma_positions(["A", "B", "C"]) == "ABC"
    assert parse_enigma_positions(["x", "y", "z"]) == "XYZ"

@pytest.mark.parametrize("positions", [
    [],
    ["A"],
    ["A", "B"],
    ["A", "B", "C", "D"],
])
def test_parse_enigma_positions_invalid_count(positions):
    with pytest.raises(HTTPException) as exc_info:
        parse_enigma_positions(positions)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Exactly 3 rotor positions must be specified."

@pytest.mark.parametrize("positions", [
    ["AB", "C", "D"],
    ["1", "B", "C"],
    ["!", "B", "C"],
    ["", "B", "C"],
])
def test_parse_enigma_positions_invalid_characters(positions):
    with pytest.raises(HTTPException) as exc_info:
        parse_enigma_positions(positions)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Rotor positions must be single letters."


def test_parse_and_validate_enigma_rings_valid():
    # Ints 1-26
    assert parse_and_validate_enigma_rings([1, 13, 26]) == [1, 13, 26]
    # String digits 1-26
    assert parse_and_validate_enigma_rings(["1", "13", "26"]) == [1, 13, 26]
    assert parse_and_validate_enigma_rings([" 1 ", " 13 ", " 26 "]) == [1, 13, 26]
    # Single letters A-Z / a-z
    assert parse_and_validate_enigma_rings(["A", "M", "Z"]) == [1, 13, 26]
    assert parse_and_validate_enigma_rings(["a", "m", "z"]) == [1, 13, 26]
    # Mixed
    assert parse_and_validate_enigma_rings([1, "M", "26"]) == [1, 13, 26]

@pytest.mark.parametrize("rings", [
    [],
    ["1"],
    ["1", "2"],
    ["1", "2", "3", "4"],
])
def test_parse_and_validate_enigma_rings_invalid_count(rings):
    with pytest.raises(HTTPException) as exc_info:
        parse_and_validate_enigma_rings(rings)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Exactly 3 ring settings must be specified."

@pytest.mark.parametrize("rings", [
    [0, 1, 2],
    [1, 27, 3],
    [-5, 10, 20],
    ["0", "1", "2"],
    ["1", "27", "3"],
    ["-5", "10", "20"],
    ["AA", "B", "C"],
    ["!", "B", "C"],
    ["", "B", "C"],
    [None, "B", "C"],
    [1.5, 2, 3],
])
def test_parse_and_validate_enigma_rings_invalid_values(rings):
    with pytest.raises(HTTPException) as exc_info:
        parse_and_validate_enigma_rings(rings)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid ring setting"


def test_validate_enigma_plugboard_valid():
    validate_enigma_plugboard([])
    validate_enigma_plugboard(["AB"])
    validate_enigma_plugboard(["AB", "CD", "EF"])
    validate_enigma_plugboard(["ab", "cd"])

@pytest.mark.parametrize("plugboard", [
    ["A"],
    ["ABC"],
    ["A1"],
    ["!@"],
    [""],
])
def test_validate_enigma_plugboard_invalid_format(plugboard):
    with pytest.raises(HTTPException) as exc_info:
        validate_enigma_plugboard(plugboard)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid plugboard swap format"

@pytest.mark.parametrize("plugboard", [
    ["AB", "BC"],
    ["AA"],
    ["AB", "BA"],
])
def test_validate_enigma_plugboard_duplicate_connection(plugboard):
    with pytest.raises(HTTPException) as exc_info:
        validate_enigma_plugboard(plugboard)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Duplicate plugboard connection"


def test_get_enigma_reflector_wiring_valid():
    assert get_enigma_reflector_wiring(None) == get_enigma_reflector_wiring("B")
    assert get_enigma_reflector_wiring("") == get_enigma_reflector_wiring("B")
    for name in ["A", "B", "C", "B_THIN", "C_THIN", "a", "b", "c", "b_thin", "c_thin"]:
        wiring = get_enigma_reflector_wiring(name)
        assert isinstance(wiring, str)
        assert len(wiring) == 26

@pytest.mark.parametrize("reflector", ["D", "INVALID", "UNKNOWN"])
def test_get_enigma_reflector_wiring_invalid(reflector):
    with pytest.raises(HTTPException) as exc_info:
        get_enigma_reflector_wiring(reflector)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == f"Invalid reflector '{reflector}'."

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


def test_parse_enigma_positions_helper():
    assert parse_enigma_positions(["a", "B", "c"]) == "ABC"
    with pytest.raises(HTTPException) as exc_info1:
        parse_enigma_positions(["A", "B"])
    assert exc_info1.value.status_code == 400
    assert "3 rotor positions" in exc_info1.value.detail.lower()

    with pytest.raises(HTTPException) as exc_info2:
        parse_enigma_positions(["A", "1", "C"])
    assert exc_info2.value.status_code == 400
    assert "single letters" in exc_info2.value.detail.lower()


def test_parse_and_validate_enigma_rings_helper():
    assert parse_and_validate_enigma_rings(["A", "B", "Z"]) == [1, 2, 26]
    assert parse_and_validate_enigma_rings(["1", "2", "26"]) == [1, 2, 26]
    assert parse_and_validate_enigma_rings([1, 2, 26]) == [1, 2, 26]

    with pytest.raises(HTTPException) as exc_info1:
        parse_and_validate_enigma_rings(["1", "2"])
    assert exc_info1.value.status_code == 400
    assert "3 ring settings" in exc_info1.value.detail.lower()

    with pytest.raises(HTTPException) as exc_info2:
        parse_and_validate_enigma_rings(["0", "1", "2"])
    assert exc_info2.value.status_code == 400
    assert "invalid ring setting" in exc_info2.value.detail.lower()

    with pytest.raises(HTTPException) as exc_info3:
        parse_and_validate_enigma_rings([27, 1, 2])
    assert exc_info3.value.status_code == 400
    assert "invalid ring setting" in exc_info3.value.detail.lower()

    with pytest.raises(HTTPException) as exc_info4:
        parse_and_validate_enigma_rings(["AB", "C", "D"])
    assert exc_info4.value.status_code == 400
    assert "invalid ring setting" in exc_info4.value.detail.lower()


def test_validate_enigma_plugboard_helper():
    validate_enigma_plugboard(["AB", "CD"])
    with pytest.raises(HTTPException) as exc_info1:
        validate_enigma_plugboard(["A1"])
    assert exc_info1.value.status_code == 400
    assert "format" in exc_info1.value.detail.lower()

    with pytest.raises(HTTPException) as exc_info2:
        validate_enigma_plugboard(["AB", "BC"])
    assert exc_info2.value.status_code == 400
    assert "duplicate" in exc_info2.value.detail.lower()


def test_get_enigma_reflector_wiring_helper():
    assert get_enigma_reflector_wiring(None) == "YRUHQSLDPXNGOKMIEBFZCWVJAT"
    assert get_enigma_reflector_wiring("a") == "EJMZALYXVBWFCRQUONTSPIKHGD"
    with pytest.raises(HTTPException) as exc_info:
        get_enigma_reflector_wiring("INVALID")
    assert exc_info.value.status_code == 400
    assert "invalid reflector" in exc_info.value.detail.lower()


# ==========================================
# MODERN CIPHER TESTS
# ==========================================

def test_parse_aes_key_lengths():
    # 16-byte text key should remain exactly 16 bytes (no key repetition)
    key_16 = parse_aes_key("123456789012345G", "text")
    assert len(key_16) == 16
    assert key_16 == b"123456789012345G"

    # 32-byte text key should remain exactly 32 bytes
    key_32 = parse_aes_key("1234567890123456123456789012345Z", "text")
    assert len(key_32) == 32
    assert key_32 == b"1234567890123456123456789012345Z"

    # 64-hex character key should parse to 32 bytes
    hex_key_32 = parse_aes_key("0123456789abcdef" * 4, "hex")
    assert len(hex_key_32) == 32

    # Invalid key length (e.g. 10 bytes) should raise HTTP 400
    with pytest.raises(Exception) as exc_info:
        parse_aes_key("short_key", "text")
    assert exc_info.value.status_code == 400

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

def test_aes_encrypt_invalid_hex_plaintext(caplog):
    payload = {
        "plaintext": "InvalidHex!",
        "key": "1234567890123456",
        "key_format": "text",
        "plaintext_format": "hex"
    }
    with caplog.at_level("WARNING"):
        response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 400
    assert "invalid hex plaintext" in response.json()["detail"].lower()
    assert "Invalid hex plaintext in AES encrypt" in caplog.text

def test_aes_encrypt_invalid_utf8_hex_plaintext(caplog):
    payload = {
        "plaintext": "FF",
        "key": "1234567890123456",
        "key_format": "text",
        "plaintext_format": "hex"
    }
    with caplog.at_level("WARNING"):
        response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 400
    assert "invalid hex plaintext" in response.json()["detail"].lower()
    assert "Invalid hex plaintext in AES encrypt" in caplog.text

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

@patch("api.main.pow", side_effect=ValueError("Modular inverse failure"))
def test_rsa_keygen_modular_inverse_error(mock_pow):
    payload = {
        "p": 61,
        "q": 53,
        "e": 17
    }
    response = client.post("/api/rsa/keygen", json=payload)
    assert response.status_code == 400
    assert "modular inverse" in response.json()["detail"].lower()

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

def test_parse_aes_key_hex_fallback():
    orig_bytes = bytes

    class MockBytes(bytes):
        @classmethod
        def fromhex(cls, string):
            if string == "0123456789abcdef0123456789abcdef":
                raise ValueError("Simulated hex decode error")
            return orig_bytes.fromhex(string)

    with patch("api.main.bytes", MockBytes):
        res = parse_aes_key("0123456789abcdef0123456789abcdef", "text")
        assert res == b"0123456789abcdef0123456789abcdef"

def test_aes_encrypt_underlying_cipher_failure(caplog):
    payload = {
        "plaintext": "Secret Message",
        "key": "1234567890123456",
        "key_format": "text",
        "plaintext_format": "text"
    }
    with patch("methods.modern.aes.encrypt_block", side_effect=Exception("Underlying block cipher error")):
        with caplog.at_level("ERROR"):
            response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Encryption failed"
    assert "AES encryption error" in caplog.text

def test_aes_encrypt_input_length_exceeded():
    payload = {
        "plaintext": "a" * 501,
        "key": "1234567890123456",
        "key_format": "text",
        "plaintext_format": "text"
    }
    response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 400
    assert "exceeds" in response.json()["detail"].lower()

def test_aes_decrypt_input_length_exceeded():
    payload = {
        "ciphertext": "a" * 501,
        "key": "1234567890123456",
        "nonce": "aabbccdd",
        "key_format": "text"
    }
    response = client.post("/api/aes/decrypt", json=payload)
    assert response.status_code == 400
    assert "exceeds" in response.json()["detail"].lower()

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



def test_caesar_encrypt_decrypt_success():
    enc = client.post("/api/caesar/encrypt", json={"plaintext": "HELLO", "shift": 3})
    assert enc.status_code == 200
    assert enc.json() == {"ciphertext": "KHOOR"}
    dec = client.post("/api/caesar/decrypt", json={"ciphertext": "KHOOR", "shift": 3})
    assert dec.status_code == 200
    assert dec.json() == {"plaintext": "HELLO"}

@patch("methods.classical.caesar.encrypt")
def test_caesar_encrypt_value_error(mock_encrypt):
    mock_encrypt.side_effect = ValueError("Invalid shift value")
    response = client.post("/api/caesar/encrypt", json={"plaintext": "HELLO", "shift": 3})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid shift value"

@patch("methods.classical.caesar.encrypt")
def test_caesar_encrypt_internal_error(mock_encrypt, caplog):
    mock_encrypt.side_effect = RuntimeError("Test internal encryption error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/caesar/encrypt", json={"plaintext": "HELLO", "shift": 3})
    assert response.status_code == 400
    assert response.json() == {"detail": "Encryption failed"}
    assert "Caesar encryption error" in caplog.text

@patch("methods.classical.caesar.decrypt")
def test_caesar_decrypt_value_error(mock_decrypt):
    mock_decrypt.side_effect = ValueError("Invalid shift value")
    response = client.post("/api/caesar/decrypt", json={"ciphertext": "KHOOR", "shift": 3})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid shift value"

@patch("methods.classical.caesar.decrypt")
def test_caesar_decrypt_internal_error(mock_decrypt, caplog):
    mock_decrypt.side_effect = RuntimeError("Test internal decryption error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/caesar/decrypt", json={"ciphertext": "KHOOR", "shift": 3})
    assert response.status_code == 400
    assert response.json() == {"detail": "Decryption failed"}
    assert "Caesar decryption error" in caplog.text

@pytest.mark.parametrize("endpoint,payload_key", [
    ("/api/caesar/encrypt", "plaintext"),
    ("/api/caesar/decrypt", "ciphertext"),
])
def test_caesar_input_too_long(endpoint, payload_key):
    long_text = "a" * 501
    response = client.post(endpoint, json={payload_key: long_text, "shift": 3})
    assert response.status_code == 400
    assert "exceeds" in response.json()["detail"].lower()

@pytest.mark.parametrize("endpoint", [
    "/api/caesar/encrypt",
    "/api/caesar/decrypt",
])
@pytest.mark.parametrize("invalid_shift", [100001, -100001, "invalid"])
def test_caesar_invalid_shift_bounds_or_type(endpoint, invalid_shift):
    payload = {"plaintext": "HELLO", "ciphertext": "KHOOR", "shift": invalid_shift}
    response = client.post(endpoint, json=payload)
    assert response.status_code == 400

@patch("methods.classical.vigenere.encrypt")
def test_vigenere_encrypt_value_error(mock_func):
    mock_func.side_effect = ValueError("Invalid Vigenere input")
    response = client.post("/api/vigenere/encrypt", json={"plaintext": "HELLO", "key": "KEY"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Vigenere input"

@patch("methods.classical.vigenere.encrypt")
def test_vigenere_encrypt_internal_error(mock_func, caplog):
    mock_func.side_effect = RuntimeError("Vigenere internal error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/vigenere/encrypt", json={"plaintext": "HELLO", "key": "KEY"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Encryption failed"}
    assert "Vigenere encryption error" in caplog.text

def test_vigenere_decrypt_empty_key():
    response = client.post("/api/vigenere/decrypt", json={"ciphertext": "HELLO", "key": ""})
    assert response.status_code == 400
    assert "cannot be empty" in response.json()["detail"].lower()

@patch("methods.classical.vigenere.decrypt")
def test_vigenere_decrypt_value_error(mock_func):
    mock_func.side_effect = ValueError("Invalid Vigenere input")
    response = client.post("/api/vigenere/decrypt", json={"ciphertext": "HELLO", "key": "KEY"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Vigenere input"

@patch("methods.classical.vigenere.decrypt")
def test_vigenere_decrypt_internal_error(mock_func, caplog):
    mock_func.side_effect = RuntimeError("Vigenere internal error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/vigenere/decrypt", json={"ciphertext": "HELLO", "key": "KEY"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Decryption failed"}
    assert "Vigenere decryption error" in caplog.text

@patch("methods.classical.playfair.encrypt")
def test_playfair_encrypt_value_error(mock_func):
    mock_func.side_effect = ValueError("Invalid Playfair input")
    response = client.post("/api/playfair/encrypt", json={"plaintext": "HELLO", "key": "KEY"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Playfair input"

@patch("methods.classical.playfair.encrypt")
def test_playfair_encrypt_internal_error(mock_func, caplog):
    mock_func.side_effect = RuntimeError("Playfair internal error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/playfair/encrypt", json={"plaintext": "HELLO", "key": "KEY"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Encryption failed"}
    assert "Playfair encryption error" in caplog.text

def test_playfair_decrypt_empty_key():
    response = client.post("/api/playfair/decrypt", json={"ciphertext": "HELLO", "key": ""})
    assert response.status_code == 400
    assert "cannot be empty" in response.json()["detail"].lower()

@patch("methods.classical.playfair.decrypt")
def test_playfair_decrypt_value_error(mock_func):
    mock_func.side_effect = ValueError("Invalid Playfair input")
    response = client.post("/api/playfair/decrypt", json={"ciphertext": "HELLO", "key": "KEY"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Playfair input"

@patch("methods.classical.playfair.decrypt")
def test_playfair_decrypt_internal_error(mock_func, caplog):
    mock_func.side_effect = RuntimeError("Playfair internal error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/playfair/decrypt", json={"ciphertext": "HELLO", "key": "KEY"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Decryption failed"}
    assert "Playfair decryption error" in caplog.text

@patch("methods.classical.affine.encrypt")
def test_affine_encrypt_value_error(mock_func):
    mock_func.side_effect = ValueError("Invalid Affine input")
    response = client.post("/api/affine/encrypt", json={"plaintext": "HELLO", "a_key": 5, "b_key": 8})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Affine input"

@patch("methods.classical.affine.decrypt")
def test_affine_decrypt_value_error(mock_func):
    mock_func.side_effect = ValueError("Invalid Affine input")
    response = client.post("/api/affine/decrypt", json={"ciphertext": "HELLO", "a_key": 5, "b_key": 8})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Affine input"

def test_scytale_decrypt_invalid_width():
    response = client.post("/api/scytale/decrypt", json={"ciphertext": "HELLO", "width": 1})
    assert response.status_code == 400
    assert "width" in response.json()["detail"].lower()

@patch("methods.historical.scytale.encrypt")
def test_scytale_encrypt_value_error(mock_func):
    mock_func.side_effect = ValueError("Invalid Scytale input")
    response = client.post("/api/scytale/encrypt", json={"plaintext": "HELLO", "width": 4})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Scytale input"

@patch("methods.historical.scytale.encrypt")
def test_scytale_encrypt_internal_error(mock_func, caplog):
    mock_func.side_effect = RuntimeError("Scytale internal error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/scytale/encrypt", json={"plaintext": "HELLO", "width": 4})
    assert response.status_code == 400
    assert response.json() == {"detail": "Encryption failed"}
    assert "Scytale encryption error" in caplog.text

@patch("methods.historical.scytale.decrypt")
def test_scytale_decrypt_value_error(mock_func):
    mock_func.side_effect = ValueError("Invalid Scytale input")
    response = client.post("/api/scytale/decrypt", json={"ciphertext": "HELLO", "width": 4})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Scytale input"

@patch("methods.historical.scytale.decrypt")
def test_scytale_decrypt_internal_error(mock_func, caplog):
    mock_func.side_effect = RuntimeError("Scytale internal error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/scytale/decrypt", json={"ciphertext": "HELLO", "width": 4})
    assert response.status_code == 400
    assert response.json() == {"detail": "Decryption failed"}
    assert "Scytale decryption error" in caplog.text

def test_polybius_encrypt_invalid_key():
    response = client.post("/api/polybius/encrypt", json={"plaintext": "HELLO", "key": "shortkey"})
    assert response.status_code == 400
    assert "25 unique letters" in response.json()["detail"].lower()

def test_polybius_decrypt_invalid_key():
    response = client.post("/api/polybius/decrypt", json={"ciphertext": "23 15", "key": "shortkey"})
    assert response.status_code == 400
    assert "25 unique letters" in response.json()["detail"].lower()

@patch("methods.historical.polybius.encrypt")
def test_polybius_encrypt_value_error(mock_func):
    mock_func.side_effect = ValueError("Invalid Polybius input")
    response = client.post("/api/polybius/encrypt", json={"plaintext": "HELLO"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Polybius input"

@patch("methods.historical.polybius.encrypt")
def test_polybius_encrypt_internal_error(mock_func, caplog):
    mock_func.side_effect = RuntimeError("Polybius internal error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/polybius/encrypt", json={"plaintext": "HELLO"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Encryption failed"}
    assert "Polybius encryption error" in caplog.text

@patch("methods.historical.polybius.decrypt")
def test_polybius_decrypt_value_error(mock_func):
    mock_func.side_effect = ValueError("Invalid Polybius input")
    response = client.post("/api/polybius/decrypt", json={"ciphertext": "23 15"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid Polybius input"

@patch("methods.historical.polybius.decrypt")
def test_polybius_decrypt_internal_error(mock_func, caplog):
    mock_func.side_effect = RuntimeError("Polybius internal error")
    with caplog.at_level("ERROR"):
        response = client.post("/api/polybius/decrypt", json={"ciphertext": "23 15"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Decryption failed"}
    assert "Polybius decryption error" in caplog.text

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

def test_vigenere_decrypt_empty_key():
    resp = client.post("/api/vigenere/decrypt", json={"ciphertext": "HELLO", "key": ""})
    assert resp.status_code == 400
    assert "cannot be empty" in resp.json()["detail"].lower()

@patch("methods.classical.vigenere.encrypt", side_effect=ValueError("Vigenere val error"))
def test_vigenere_encrypt_value_error(mock_enc):
    resp = client.post("/api/vigenere/encrypt", json={"plaintext": "HELLO", "key": "LEMON"})
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Vigenere val error"

@patch("methods.classical.vigenere.encrypt", side_effect=Exception("Vigenere error"))
def test_vigenere_encrypt_exception(mock_enc, caplog):
    with caplog.at_level("ERROR"):
        resp = client.post("/api/vigenere/encrypt", json={"plaintext": "HELLO", "key": "LEMON"})
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Encryption failed"
    assert "Vigenere encryption error" in caplog.text

@patch("methods.classical.vigenere.decrypt", side_effect=ValueError("Vigenere dec val error"))
def test_vigenere_decrypt_value_error(mock_dec):
    resp = client.post("/api/vigenere/decrypt", json={"ciphertext": "HELLO", "key": "LEMON"})
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Vigenere dec val error"

@patch("methods.classical.vigenere.decrypt", side_effect=Exception("Vigenere dec error"))
def test_vigenere_decrypt_exception(mock_dec, caplog):
    with caplog.at_level("ERROR"):
        resp = client.post("/api/vigenere/decrypt", json={"ciphertext": "HELLO", "key": "LEMON"})
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Decryption failed"
    assert "Vigenere decryption error" in caplog.text

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

def test_playfair_decrypt_empty_key():
    resp = client.post("/api/playfair/decrypt", json={"ciphertext": "HELLO", "key": ""})
    assert resp.status_code == 400
    assert "cannot be empty" in resp.json()["detail"].lower()

@patch("methods.classical.playfair.encrypt", side_effect=ValueError("Playfair val error"))
def test_playfair_encrypt_value_error(mock_enc):
    resp = client.post("/api/playfair/encrypt", json={"plaintext": "HELLO", "key": "MONARCHY"})
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Playfair val error"

@patch("methods.classical.playfair.encrypt", side_effect=Exception("Playfair error"))
def test_playfair_encrypt_exception(mock_enc, caplog):
    with caplog.at_level("ERROR"):
        resp = client.post("/api/playfair/encrypt", json={"plaintext": "HELLO", "key": "MONARCHY"})
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Encryption failed"
    assert "Playfair encryption error" in caplog.text

@patch("methods.classical.playfair.decrypt", side_effect=ValueError("Playfair dec val error"))
def test_playfair_decrypt_value_error(mock_dec):
    resp = client.post("/api/playfair/decrypt", json={"ciphertext": "HELLO", "key": "MONARCHY"})
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Playfair dec val error"

@patch("methods.classical.playfair.decrypt", side_effect=Exception("Playfair dec error"))
def test_playfair_decrypt_exception(mock_dec, caplog):
    with caplog.at_level("ERROR"):
        resp = client.post("/api/playfair/decrypt", json={"ciphertext": "HELLO", "key": "MONARCHY"})
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Decryption failed"
    assert "Playfair decryption error" in caplog.text


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

def test_enigma_api_value_error_exception():
    with patch("api.main.build_enigma_machine", side_effect=ValueError("Enigma value error")):
        resp = client.post("/api/enigma/encipher", json={
            "plaintext": "HELLO",
            "rotors": ["I", "II", "III"],
            "positions": ["A", "A", "A"],
            "rings": ["A", "A", "A"],
            "plugboard": []
        })
        assert resp.status_code == 400
        assert resp.json()["detail"] == "Enigma value error"

def test_enigma_invalid_reflector():
    resp = client.post("/api/enigma/encipher", json={
        "plaintext": "HELLO",
        "rotors": ["I", "II", "III"],
        "positions": ["A", "A", "A"],
        "rings": ["A", "A", "A"],
        "reflector": "INVALID_R",
        "plugboard": []
    })
    assert resp.status_code == 400
    assert "invalid reflector" in resp.json()["detail"].lower()

@pytest.mark.parametrize("rings", [
    [0, 1, 1],
    [1, 27, 1],
    ["0", "1", "1"],
    ["27", "1", "1"],
    ["AA", "A", "A"],
    [1.5, 1, 1],
    ["1", "2"],
])
def test_enigma_invalid_ring_settings(rings):
    resp = client.post("/api/enigma/encipher", json={
        "plaintext": "HELLO",
        "rotors": ["I", "II", "III"],
        "positions": ["A", "A", "A"],
        "rings": rings,
        "plugboard": []
    })
    assert resp.status_code == 400

@pytest.mark.parametrize("positions", [
    ["A", "A"],
    ["AA", "A", "A"],
    ["1", "A", "A"],
])
def test_enigma_invalid_positions(positions):
    resp = client.post("/api/enigma/encipher", json={
        "plaintext": "HELLO",
        "rotors": ["I", "II", "III"],
        "positions": positions,
        "rings": ["A", "A", "A"],
        "plugboard": []
    })
    assert resp.status_code == 400

def test_lorenz_api_decrypt_runtime_error_exception(caplog):
    with patch("methods.historical.lorenz.Lorenz.decrypt_text", side_effect=RuntimeError("Test Lorenz Decrypt RuntimeError")):
        with caplog.at_level("ERROR"):
            resp = client.post("/api/lorenz/decrypt", json={"ciphertext": "HELLO"})
        assert resp.status_code == 400
        assert resp.json() == {"detail": "Decryption failed"}
        assert "Lorenz decryption error" in caplog.text


# ==========================================
# CORS ORIGIN VALIDATION TESTS
# ==========================================

@pytest.mark.parametrize("origin", [
    "http://localhost:3000",
    "http://localhost:3000/",
    "https://example.com",
    "https://sub.domain.example.com:8443",
    "http://127.0.0.1",
    "http://127.0.0.1:8080",
    "http://192.168.1.1",
    "http://[::1]",
    "https://[::1]:8080",
    "https://[2001:db8::1]",
    "https://[2001:db8::1]:443",
    "http://example.com:1",
    "http://example.com:65535",
    "  http://example.com  ",
    "http://localhost:1",
    "http://localhost:65535",
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
    "file:///etc/passwd",
    "javascript:alert(1)",
    "mailto:user@example.com",
    "localhost:3000",
    "http://example.com/path",
    "http://example.com//",
    "http://example.com?query=1",
    "http://example.com#fragment",
    "http://example.com;matrix=1",
    "http://user:pass@example.com",
    "http://user@example.com",
    "http://",
    "https://",
    "http://example.com:0",
    "http://example.com:65536",
    "http://example.com:badport",
    "http://example.com:",
    "http://[not-an-ip]:8080",
    "http://localhost:0",
    "http://localhost:65536",
    "http://localhost:99999",
    "http://localhost:-1",
    "http://example com",
    "http://example\tcom",
    "http://example\ncom",
    "http://example\rcom",
    'http://example"com',
    "http://example'com",
    "http://example<com",
    "http://example>com",
    "http://[invalid-ipv6]:8080",
    "http://[2001:::1]:80",
    "http://[gggg::1]",
    "http://[:::1]",
    "",
    "   ",
    None,
    123,
    45.67,
    [],
    {},
    True,
    False,
])
def test_is_valid_origin_invalid_cases(origin):
    assert is_valid_origin(origin) is False

def test_is_valid_origin_port_boundaries():
    assert is_valid_origin("http://localhost:1") is True
    assert is_valid_origin("http://localhost:65535") is True
    assert is_valid_origin("http://localhost:0") is False
    assert is_valid_origin("http://localhost:65536") is False

def test_is_valid_origin_ipv6_validation():
    # Valid IPv6 literals
    assert is_valid_origin("http://[::1]") is True
    assert is_valid_origin("http://[::1]:8080") is True
    assert is_valid_origin("https://[2001:db8::1]:443") is True

    # Invalid IPv6 literals inside brackets
    assert is_valid_origin("http://[not-an-ip]:8080") is False
    assert is_valid_origin("http://[2001:::1]:80") is False
    assert is_valid_origin("http://[127.0.0.1.1]:80") is False

def test_is_valid_origin_ipaddress_value_error():
    with patch("ipaddress.ip_address", side_effect=ValueError("Invalid IP")):
        assert is_valid_origin("http://[::1]:8080") is False

def test_is_valid_origin_forbidden_characters():
    forbidden = [" ", "\t", "\r", "\n", "<", ">", '"', "'", ";", "@"]
    for char in forbidden:
        assert is_valid_origin(f"http://example{char}.com") is False

def test_is_valid_origin_non_string_inputs():
    for val in [None, 0, 123, 3.14, [], {}, set(), True, False]:
        assert is_valid_origin(val) is False

def test_is_valid_origin_exception_handling():
    with patch("api.main.urlparse", side_effect=ValueError("Parse failed")):
        assert is_valid_origin("https://example.com") is False

def test_is_valid_origin_unexpected_exception(caplog):
    with patch("api.main.urlparse", side_effect=RuntimeError("Unexpected urlparse error")):
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

def test_enigma_encipher_oversized_element_string():
    payload = {
        "plaintext": "HELLO",
        "rotors": ["I" * 20, "II", "III"],
        "positions": ["A", "A", "A"],
        "rings": ["A", "A", "A"],
        "plugboard": []
    }
    response = client.post("/api/enigma/encipher", json=payload)
    assert response.status_code == 400

def test_lorenz_encrypt_oversized_nested_pins():
    payload = {
        "plaintext": "HELLO",
        "chi_pins": [[1] * 100]
    }
    response = client.post("/api/lorenz/encrypt", json=payload)
    assert response.status_code == 400

def test_lorenz_encrypt_out_of_bounds_position():
    payload = {
        "plaintext": "HELLO",
        "positions": [100000] * 12
    }
    response = client.post("/api/lorenz/encrypt", json=payload)
    assert response.status_code == 400

def test_aes_encrypt_oversized_format():
    payload = {
        "plaintext": "HELLO",
        "key": "1234567890123456",
        "key_format": "text" * 10
    }
    response = client.post("/api/aes/encrypt", json=payload)
    assert response.status_code == 400






