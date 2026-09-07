import pytest
from methods.modern.symmetric import (
    encrypt, decrypt, generate_key, generate_iv,
    pkcs7_pad, pkcs7_unpad, encrypt_with_new_key,
    encrypt_block, decrypt_block, key_expansion, add_round_key,
    sub_bytes, inv_sub_bytes, SBOX, INV_SBOX,
    mix_columns, inv_mix_columns, rot_word, xtime, mul_gf
)

def test_pkcs7_padding():
    data = b"Hello"
    padded = pkcs7_pad(data)
    assert len(padded) % 16 == 0
    assert padded == b"Hello\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b"
    unpadded = pkcs7_unpad(padded)
    assert unpadded == data

def test_pkcs7_unpad_invalid_bytes():
    with pytest.raises(ValueError, match="Invalid PKCS7 padding bytes"):
        pkcs7_unpad(b"Hello\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0a")

def test_pkcs7_unpad_invalid_value():
    with pytest.raises(ValueError, match="Invalid PKCS7 padding value"):
        pkcs7_unpad(b"Hello\x11")

    with pytest.raises(ValueError, match="Invalid PKCS7 padding value"):
        pkcs7_unpad(b"Hello\x00")

def test_encrypt_decrypt():
    message = "Secret message"
    key = generate_key()
    iv = generate_iv()

    ciphertext = encrypt(message, key, iv)
    assert isinstance(ciphertext, bytes)
    assert len(ciphertext) > 0

    plaintext = decrypt(ciphertext, key, iv)
    assert plaintext == message

def test_encrypt_empty_message():
    message = ""
    key = generate_key()
    iv = generate_iv()

    ciphertext = encrypt(message, key, iv)
    plaintext = decrypt(ciphertext, key, iv)
    assert plaintext == message

def test_kat_aes_256_cbc():
    """Known Answer Test for AES-256 in CBC mode."""
    key = bytes([i for i in range(32)])
    iv = bytes([i for i in range(16)])
    message = "Known answer test for AES-256 CBC"

    expected_ciphertext = bytes.fromhex(
        "0677792407c396879dfe465ca9958063813e3616b4faaf11c021e2b563ed9b5361a9e1c330a6dee3feabdc49bb8a1f70"
    )

    ciphertext = encrypt(message, key, iv)
    assert ciphertext == expected_ciphertext

    plaintext = decrypt(expected_ciphertext, key, iv)
    assert plaintext == message

def test_kat_aes_256_cbc_large_message():
    """Known Answer Test for AES-256 in CBC mode with a larger message."""
    key = bytes([i for i in range(32, 64)])
    iv = bytes([i for i in range(16, 32)])
    message = "A" * 100

    expected_ciphertext = bytes.fromhex(
        "af2a4fd5a1e5e4ded6db731d778297947b69df614ce796a9dff2b46e77e65e9c12eecc8bd0a3c9fa9a7d707cc137ce735eeaa94cb389aeaae2027dffbb726fd95d14eba28938c9698bf13cddc49ea7844c2b4e4ceb37449d48d68fe1d5d41b53d0adc4f2f10f0a9971bea30c12b759be"
    )

    ciphertext = encrypt(message, key, iv)
    assert ciphertext == expected_ciphertext

    plaintext = decrypt(expected_ciphertext, key, iv)
    assert plaintext == message

def test_encrypt_with_new_key():
    message = "Test new key generation"
    ciphertext, key, iv = encrypt_with_new_key(message)

    assert len(key) == 32
    assert len(iv) == 16
    assert isinstance(ciphertext, bytes)

    plaintext = decrypt(ciphertext, key, iv)
    assert plaintext == message

def test_single_block_encryption_decryption():
    """Test raw block encryption and decryption to ensure no data loss in core AES functions."""
    key = generate_key()
    block = bytes([i for i in range(16)])
    round_keys = key_expansion(key)

    encrypted_block = encrypt_block(block, round_keys)
    assert len(encrypted_block) == 16
    assert encrypted_block != block

    decrypted_block = decrypt_block(encrypted_block, round_keys)
    assert decrypted_block == block

def test_key_expansion_invalid_key_length():
    with pytest.raises(ValueError, match="Key length must be 16, 24, or 32 bytes"):
        key_expansion(b"12345") # 5 bytes

def test_sub_bytes_known_state():
    """Test sub_bytes with a known input state against expected S-box substitution values."""
    input_state = [0x00, 0x01, 0x02, 0x0f, 0x10, 0x53, 0xff, 0x80, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde]
    expected_output = [SBOX[b] for b in input_state]

    output_state = sub_bytes(input_state)
    assert output_state == expected_output
    assert len(output_state) == len(input_state)
    # Check specific expected values from SBOX
    # SBOX[0x00] == 0x63, SBOX[0x01] == 0x7c, SBOX[0x02] == 0x77, SBOX[0x0f] == 0x76, SBOX[0xff] == 0x16
    assert output_state[0] == 0x63
    assert output_state[1] == 0x7c
    assert output_state[2] == 0x77
    assert output_state[3] == 0x76
    assert output_state[6] == 0x16

def test_sub_bytes_inv_sub_bytes_roundtrip():
    """Test that applying sub_bytes followed by inv_sub_bytes returns the original state."""
    input_state = list(range(16))
    sub_state = sub_bytes(input_state)
    restored_state = inv_sub_bytes(sub_state)
    assert restored_state == input_state

def test_key_expansion_valid_key_lengths():
    # 16 bytes
    key16 = b"1" * 16
    assert len(key_expansion(key16)) > 0

    # 24 bytes
    key24 = b"1" * 24
    assert len(key_expansion(key24)) > 0

    # 32 bytes
    key32 = b"1" * 32
    assert len(key_expansion(key32)) > 0



def test_mix_columns_kat():
    """Test mix_columns against standard FIPS 197 AES test vectors."""
    # FIPS 197 Appendix B example column 1: [0xd4, 0xbf, 0x5d, 0x30] -> [0x04, 0x66, 0x81, 0xe5]
    state = [
        0xd4, 0xbf, 0x5d, 0x30,
        0xe0, 0xb4, 0x52, 0xae,
        0xb8, 0x41, 0x11, 0xf1,
        0x1e, 0x27, 0x98, 0xe5
    ]
    expected = [
        0x04, 0x66, 0x81, 0xe5,
        0xe0, 0xcb, 0x19, 0x9a,
        0x48, 0xf8, 0xd3, 0x7a,
        0x28, 0x06, 0x26, 0x4c
    ]
    assert mix_columns(state) == expected

def test_mix_columns_zero_state():
    """Test mix_columns on all-zero state matrix."""
    state = [0] * 16
    assert mix_columns(state) == [0] * 16
    assert inv_mix_columns(state) == [0] * 16

def test_mix_columns_inv_mix_columns_random_roundtrip():
    """Test that inv_mix_columns reverses mix_columns for arbitrary states."""
    import secrets
    for _ in range(10):
        state = list(secrets.token_bytes(16))
        mixed = mix_columns(state)
        unmixed = inv_mix_columns(mixed)
        assert unmixed == state

def test_inv_mix_columns_kat():
    """Known Answer Test for inv_mix_columns."""
    # Known column output after mix_columns([0xdb, 0x13, 0x53, 0x45]) is [0x8e, 0x4d, 0xa1, 0xbc]
    mixed_state = [
        0x8e, 0x4d, 0xa1, 0xbc,
        0x8e, 0x4d, 0xa1, 0xbc,
        0x8e, 0x4d, 0xa1, 0xbc,
        0x8e, 0x4d, 0xa1, 0xbc
    ]
    expected_unmixed = [
        0xdb, 0x13, 0x53, 0x45,
        0xdb, 0x13, 0x53, 0x45,
        0xdb, 0x13, 0x53, 0x45,
        0xdb, 0x13, 0x53, 0x45
    ]
    assert inv_mix_columns(mixed_state) == expected_unmixed

def test_mix_columns_inv_mix_columns_roundtrip():
    """Test that inv_mix_columns is the exact inverse of mix_columns."""
    state = [i * 17 % 256 for i in range(16)]
    mixed = mix_columns(state)
    unmixed = inv_mix_columns(mixed)
    assert unmixed == state
    assert mix_columns(unmixed) == mixed

def test_rot_word():
    """Test 1-byte left rotation on a 4-byte word."""
    word = [0x01, 0x02, 0x03, 0x04]
    original = word.copy()

    rotated = rot_word(word)
    assert rotated == [0x02, 0x03, 0x04, 0x01]
    # Ensure original list was not modified in-place
    assert word == original

    # Test full 4-rotation cycle returns to original
    w = word
    for _ in range(4):
        w = rot_word(w)
    assert w == word

    # Test word with identical elements
    same_word = [0xFF, 0xFF, 0xFF, 0xFF]
    assert rot_word(same_word) == same_word

def test_xtime_edge_cases_and_vectors():
    """Test xtime GF(2^8) multiplication by 2 with edge cases and known values."""
    # 0x00 -> 0x00
    assert xtime(0x00) == 0x00

    # 0x01 shifted left by 1 -> 0x02 (no MSB reduction)
    assert xtime(0x01) == 0x02

    # 0x57 * 2 in GF(2^8) (standard FIPS-197 / AES vector example)
    # 0x57 (01010111) -> << 1 = 10101110 (0xAE) without MSB reduction since MSB was 0
    assert xtime(0x57) == 0xAE

    # 0xAE * 2 in GF(2^8) (0xAE has MSB set: 10101110)
    # (0xAE << 1) ^ 0x1B & 0xFF -> (0x15C ^ 0x1B) & 0xFF -> 0x147 & 0xFF = 0x47
    assert xtime(0xAE) == 0x47

    # 0x7F boundary (MSB not set: 01111111) -> 0xFE
    assert xtime(0x7F) == 0xFE

    # 0x80 boundary (MSB set: 10000000) -> (0x100 ^ 0x1B) & 0xFF = 0x1B
    assert xtime(0x80) == 0x1B

    # 0x81 (MSB set: 10000001) -> (0x102 ^ 0x1B) & 0xFF = 0x19
    assert xtime(0x81) == 0x19

    # 0xFF (MSB set: 11111111) -> (0x1FE ^ 0x1B) & 0xFF = 0xE5
    assert xtime(0xFF) == 0xE5

def test_xtime_matches_mul_gf():
    """Verify xtime matches mul_gf(val, 2) for all byte values from 0 to 255."""
    for byte_val in range(256):
        assert xtime(byte_val) == mul_gf(byte_val, 2)

def test_shift_rows():
    """Test shift_rows function with a 16-byte state represented as 0..15."""
    from methods.modern.symmetric import shift_rows, inv_shift_rows

    # State elements 0..15 corresponding to AES matrix positions
    state = list(range(16))

    expected_shifted = [
        0, 5, 10, 15,
        4, 9, 14, 3,
        8, 13, 2, 7,
        12, 1, 6, 11
    ]

    shifted = shift_rows(state)
    assert shifted == expected_shifted

    # Test inverse shift rows restores original state
    restored = inv_shift_rows(shifted)
    assert restored == state

def test_inv_shift_rows():
    """Test inv_shift_rows function directly with a known input state."""
    from methods.modern.symmetric import inv_shift_rows

    state = list(range(16))
    expected_inv_shifted = [
        0, 13, 10, 7,
        4, 1, 14, 11,
        8, 5, 2, 15,
        12, 9, 6, 3
    ]
    assert inv_shift_rows(state) == expected_inv_shifted
 
def test_inv_sub_bytes():
    """Test inv_sub_bytes direct transformation and inverse relationship with sub_bytes."""
    state = list(range(16))
    expected_inv = [INV_SBOX[b] for b in state]

    assert inv_sub_bytes(state) == expected_inv

    # Verify that inv_sub_bytes(sub_bytes(state)) returns original state for all possible byte values 0..255
    all_bytes = list(range(256))
    subbed = sub_bytes(all_bytes)
    inv_subbed = inv_sub_bytes(subbed)
    assert inv_subbed == all_bytes
 
def test_add_round_key():
    """Test XOR state with round key in AES."""
    state = [0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]
    round_key = [0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa, 0x99, 0x88, 0x77, 0x66, 0x55, 0x44, 0x33, 0x22, 0x11, 0x00]
    expected = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]

    result = add_round_key(state, round_key)
    assert result == expected

    # Identity property: state XOR zeros == state
    zero_key = [0x00] * 16
    assert add_round_key(state, zero_key) == state

    # Involution property: add_round_key twice with same key returns original state
    assert add_round_key(result, round_key) == state
