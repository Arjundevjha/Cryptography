from methods.modern.helpers import (
    b64encode, b64decode, rotr, shr,
    ch_func, maj_func, sigma_0_upper, sigma_1_upper, sigma_0_lower, sigma_1_lower,
    sha256, hmac_sha256
)

import base64
import pytest


def test_b64encode_rfc_vectors():
    """Test Base64 encoding against standard RFC 4648 test vectors."""
    assert b64encode(b"") == ""
    assert b64encode(b"f") == "Zg=="
    assert b64encode(b"fo") == "Zm8="
    assert b64encode(b"foo") == "Zm9v"
    assert b64encode(b"foob") == "Zm9vYg=="
    assert b64encode(b"fooba") == "Zm9vYmE="
    assert b64encode(b"foobar") == "Zm9vYmFy"


def test_b64encode_padding_cases():
    """Test Base64 encoding padding rules (0, 1, and 2 '=' padding characters)."""
    # 3 bytes -> no padding
    encoded_no_pad = b64encode(b"ABC")
    assert len(encoded_no_pad) % 4 == 0
    assert not encoded_no_pad.endswith("=")

    # 2 bytes -> 1 padding char '='
    encoded_one_pad = b64encode(b"AB")
    assert len(encoded_one_pad) % 4 == 0
    assert encoded_one_pad.endswith("=") and not encoded_one_pad.endswith("==")

    # 1 byte -> 2 padding chars '=='
    encoded_two_pad = b64encode(b"A")
    assert len(encoded_two_pad) % 4 == 0
    assert encoded_two_pad.endswith("==")


def test_b64encode_binary_and_edge_values():
    """Test Base64 encoding with extreme binary values (0x00, 0xFF, full byte ranges)."""
    assert b64encode(b"\x00") == "AA=="
    assert b64encode(b"\x00\x00") == "AAA="
    assert b64encode(b"\x00\x00\x00") == "AAAA"

    assert b64encode(b"\xff") == "/w=="
    assert b64encode(b"\xff\xff") == "//8="
    assert b64encode(b"\xff\xff\xff") == "////"

    # All bytes 0x00 through 0xFF
    all_bytes = bytes(range(256))
    expected = base64.b64encode(all_bytes).decode("utf-8")
    assert b64encode(all_bytes) == expected


@pytest.mark.parametrize("length", range(0, 65))
def test_b64encode_stdlib_parity(length: int):
    """Verify b64encode matches standard library base64.b64encode for various payload lengths."""
    data = bytes((i * 37) % 256 for i in range(length))
    expected = base64.b64encode(data).decode("utf-8")
    assert b64encode(data) == expected


def test_b64encode_bytearray_input():
    """Test Base64 encoding with bytearray inputs."""
    data = bytearray(b"Hello Base64")
    expected = base64.b64encode(data).decode("utf-8")
    assert b64encode(data) == expected


def test_b64encode_roundtrip():
    """Test roundtrip encoding and decoding for various byte payloads."""
    payloads = [
        b"",
        b"Hello, World!",
        b"\x00\x01\x02\x03\x04\x05",
        bytes(range(256)),
        b"Digital Signature Helper Base64 Test Data" * 10,
    ]
    for payload in payloads:
        encoded = b64encode(payload)
        decoded = b64decode(encoded)
        assert decoded == payload

def test_b64decode():
    assert b64decode("") == b""
    assert b64decode("Zg==") == b"f"
    assert b64decode("Zm8=") == b"fo"
    assert b64decode("Zm9v") == b"foo"
    assert b64decode("Zm9vYg==") == b"foob"
    assert b64decode("Zm9vYmE=") == b"fooba"
    assert b64decode("Zm9vYmFy") == b"foobar"
    # test stripping whitespace
    assert b64decode("  Zm9vYmFy \n\r") == b"foobar"

def test_bitwise_operations():
    # Test 32-bit bound and rotation
    val = 0x80000001
    assert rotr(val, 1) == 0xC0000000
    assert rotr(val, 31) == 0x00000003
    assert shr(val, 1) == 0x40000000

def test_sha256_logic_funcs_specifics():
    # ch(x, y, z) = (x & y) ^ (~x & z)
    # In Python, ~x for x > 0 gives a negative number, but when masked or combined with positive z,
    # it behaves consistently with two's complement. Wait, we should make sure it stays 32-bit if it matters,
    # but the sha256 loop explicitly does `& 0xFFFFFFFF` at the end of additions, and bitwise ops on positive ints
    # masked by positive z will yield bounded results, EXCEPT ~x & z.
    # Let's test this carefully.
    x, y, z = 1, 2, 3
    # ~1 = -2. -2 in binary is ...1111111111111110
    # -2 & 3 = 2
    # 1 & 2 = 0
    # 0 ^ 2 = 2
    assert ch_func(1, 2, 3) == 2

    # maj(x, y, z) = (x & y) ^ (x & z) ^ (y & z)
    # 1 & 2 = 0
    # 1 & 3 = 1
    # 2 & 3 = 2
    # 0 ^ 1 ^ 2 = 3
    assert maj_func(1, 2, 3) == 3

    assert sigma_0_upper(0x80000000) == (rotr(0x80000000, 2) ^ rotr(0x80000000, 13) ^ rotr(0x80000000, 22))
    assert sigma_1_upper(0x80000000) == (rotr(0x80000000, 6) ^ rotr(0x80000000, 11) ^ rotr(0x80000000, 25))
    assert sigma_0_lower(0x80000000) == (rotr(0x80000000, 7) ^ rotr(0x80000000, 18) ^ shr(0x80000000, 3))
    assert sigma_1_lower(0x80000000) == (rotr(0x80000000, 17) ^ rotr(0x80000000, 19) ^ shr(0x80000000, 10))

def test_sha256_kat():
    assert sha256(b'').hex() == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    assert sha256(b'abc').hex() == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    assert sha256(b'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq').hex() == "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"

def test_hmac_sha256_kat():
    msg = b'The quick brown fox jumps over the lazy dog'
    key1 = b'key'
    assert hmac_sha256(key1, msg).hex() == "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8"

    key2 = b'a' * 100
    assert hmac_sha256(key2, msg).hex() == "ee128dd7d40b70b8e0f75153d8541bd8fd9685cf8fbec61719ed8b542b81f07c"
