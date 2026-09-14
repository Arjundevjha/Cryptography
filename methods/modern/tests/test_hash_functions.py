import warnings
import pytest
import hashlib
from methods.modern.hash_functions import (
    sha256,
    sha512,
    sha3_256,
    compute_hash,
    HASH_FUNCTIONS,
    md5,
    sha1,
    blake2b,
    blake2s,
    SecurityWarning,
)


def test_compute_hash_value_error():
    """Test that compute_hash raises a ValueError for unsupported algorithms."""
    with pytest.raises(ValueError) as excinfo:
        compute_hash("test data", "unsupported_algo")

    assert "Unsupported algorithm: unsupported_algo" in str(excinfo.value)


def test_sha256_kats():
    """Test SHA-256 implementation against known-answer vectors."""
    assert sha256("") == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    assert sha256("abc") == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    assert sha256("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq") == (
        "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"
    )
    assert compute_hash("abc", "sha256") == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"


def test_sha512_kats():
    """Test SHA-512 implementation against known-answer vectors."""
    assert sha512("") == (
        "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce"
        "47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"
    )
    assert sha512("abc") == (
        "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a"
        "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
    )
    assert sha512("abcdefghbcdefghicdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq") == (
        "53931222059312508aae877c41b276230d48f0ef30b034c190a9b11b47235f68"
        "ed71522a3a4fec604d8bf10336284602bf28d0756a0f690d63ce86495874b71c"
    )
    assert (
        sha512("The quick brown fox jumps over the lazy dog")
        == "07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6"
    )
    assert (
        sha512("abcdefghbcdefghi23456789345678904567890156789012678901237890123489012345")
        == "2aa48b769a279f9a51ed5f48ddd3ed3cbfe0c515a90f0f8f7da47e670b0d814b5b20aaaab72d6a278a82701f187830928cda4a60abf3c584b7086de2ca21fc7e"
    )
    assert compute_hash("abc", "sha512") == (
        "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a"
        "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
    )


def test_sha512_block_boundaries_and_unicode():
    """Test SHA-512 against standard hashlib for various block sizes, boundaries, and UTF-8 string inputs."""
    test_cases = [
        # Boundary around PADDING_TARGET_112 (112 bytes)
        "a" * 111,
        "a" * 112,
        "a" * 113,
        # Boundary around PADDING_MOD_128 (128 bytes block)
        "a" * 127,
        "a" * 128,
        "a" * 129,
        # Multi-block (>128 bytes)
        "a" * 256,
        "a" * 300,
        # UTF-8 / Multibyte unicode characters
        "Cryptographie UTF-8: 🔒 key & 🔑 cipher! 🎉",
        "Hello World 🌍! 日本語テスト",
    ]

    for data in test_cases:
        expected = hashlib.sha512(data.encode("utf-8")).hexdigest()
        assert sha512(data) == expected
        assert compute_hash(data, "sha512") == expected


def test_all_hash_functions_non_empty():
    """Test that all hash functions compute non-empty digests."""
    for algo in HASH_FUNCTIONS:
        res = compute_hash("hello world", algo)
        assert isinstance(res, str) and len(res) > 0


def test_md5_warning_and_output():
    """Test that md5 function triggers a SecurityWarning and computes expected hash."""
    with pytest.warns(SecurityWarning, match="MD5 is cryptographically broken"):
        result = md5("hello world")

    # Known MD5 hash KAT for "hello world"
    assert result == "5eb63bbbe01eeed093cb22bb8f5acdc3"


def test_compute_hash_md5_warning():
    """Test compute_hash with 'md5' algorithm triggers SecurityWarning."""
    with pytest.warns(SecurityWarning, match="MD5 is cryptographically broken"):
        result = compute_hash("hello world", "md5")

    assert result == "5eb63bbbe01eeed093cb22bb8f5acdc3"


def test_sha1_kat_and_warning():
    """Test SHA-1 KAT correctness and verify SecurityWarning emission."""
    with pytest.warns(SecurityWarning, match="SHA-1 is cryptographically broken"):
        digest = sha1("The quick brown fox jumps over the lazy dog")
    assert digest == "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12"

    with pytest.warns(SecurityWarning, match="SHA-1 is cryptographically broken"):
        empty_digest = compute_hash("", "sha1")
    assert empty_digest == "da39a3ee5e6b4b0d3255bfef95601890afd80709"


def test_blake2b_kats_and_compute_hash():
    """Test BLAKE2b implementation against known-answer vectors and hashlib standard."""
    # Test empty string input KAT
    expected_empty = hashlib.blake2b(b"").hexdigest()
    assert blake2b("") == expected_empty
    assert (
        blake2b("")
        == "786a02f742015903c6c6fd852552d272912f4740e15847618a86e217f71f5419d25e1031afee585313896444934eb04b903a685b1448b755d56f701afe9be2ce"
    )

    # Test short ASCII string input ("abc")
    expected_abc = hashlib.blake2b(b"abc").hexdigest()
    assert blake2b("abc") == expected_abc
    assert (
        blake2b("abc")
        == "ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923"
    )
    assert compute_hash("abc", "blake2b") == expected_abc

    # Test medium string input
    phrase = "The quick brown fox jumps over the lazy dog"
    expected_phrase = hashlib.blake2b(phrase.encode("utf-8")).hexdigest()
    assert blake2b(phrase) == expected_phrase
    assert (
        blake2b(phrase)
        == "a8add4bdddfd93e4877d2746e62817b116364a1fa7bc148d95090bc7333b3673f82401cf7aa2e4cb1ecd90296e3f14cb5413f8ed77be73045b13914cdcd6a918"
    )

    # Test multi-block string input (> 128 bytes block size)
    long_data = "a" * 250
    expected_long = hashlib.blake2b(long_data.encode("utf-8")).hexdigest()
    assert blake2b(long_data) == expected_long
    assert compute_hash(long_data, "blake2b") == expected_long

    # Test additional string cases (boundary and special characters)
    test_cases = [
        "1234567890",
        "BLAKE2b cryptographic hash test vector validation",
        "Hello World 🌍! 日本語テスト",
    ]

    for data in test_cases:
        expected = hashlib.blake2b(data.encode("utf-8")).hexdigest()
        assert blake2b(data) == expected
        assert compute_hash(data, "blake2b") == expected


def test_blake2s_kats_and_compute_hash():
    """Test BLAKE2s implementation against known-answer vectors and hashlib standard."""
    # Test empty string input
    expected_empty = hashlib.blake2s(b"").hexdigest()
    assert blake2s("") == expected_empty

    # Test short ASCII string input ("abc")
    expected_abc = hashlib.blake2s(b"abc").hexdigest()
    assert blake2s("abc") == expected_abc
    assert compute_hash("abc", "blake2s") == expected_abc

    # Test medium string input
    phrase = "The quick brown fox jumps over the lazy dog"
    expected_phrase = hashlib.blake2s(phrase.encode("utf-8")).hexdigest()
    assert blake2s(phrase) == expected_phrase

    # Test multi-block string input (> 64 bytes block size)
    long_data = "a" * 150
    expected_long = hashlib.blake2s(long_data.encode("utf-8")).hexdigest()
    assert blake2s(long_data) == expected_long
    assert compute_hash(long_data, "blake2s") == expected_long


def test_sha3_256_kats():
    """Test SHA3-256 implementation against known-answer vectors, boundary conditions, and Unicode."""
    # Empty string KAT
    assert (
        sha3_256("")
        == hashlib.sha3_256(b"").hexdigest()
    )
    assert (
        sha3_256("")
        == "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"
    )

    # Standard short input KAT
    assert (
        sha3_256("abc")
        == hashlib.sha3_256(b"abc").hexdigest()
    )
    assert (
        sha3_256("abc")
        == "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532"
    )

    # Standard sentence KAT
    sentence = "The quick brown fox jumps over the lazy dog"
    assert (
        sha3_256(sentence)
        == hashlib.sha3_256(sentence.encode("utf-8")).hexdigest()
    )
    assert (
        sha3_256(sentence)
        == "69070dda01975c8c120c3aada1b282394e7f032fa9cf32f4cb2259a0897dfc04"
    )

    # Long NIST KAT input
    long_nist_input = "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"
    assert (
        sha3_256(long_nist_input)
        == hashlib.sha3_256(long_nist_input.encode("utf-8")).hexdigest()
    )
    assert (
        sha3_256(long_nist_input)
        == "41c0dba2a9d6240849100376a8235e2c82e1b9998a999e21db32dd97496d3376"
    )

    # Multi-block / boundary conditions (SHA3-256 block size rate = 136 bytes)
    # Testing boundaries around rate multiples (134, 135, 136, 137, 271, 272, 273 bytes)
    boundary_sizes = [134, 135, 136, 137, 271, 272, 273, 500]
    for size in boundary_sizes:
        test_input = "x" * size
        expected = hashlib.sha3_256(test_input.encode("utf-8")).hexdigest()
        assert sha3_256(test_input) == expected
        assert compute_hash(test_input, "sha3_256") == expected

    # Specific KAT checks for rate boundaries
    b135 = "a" * 135
    assert (
        sha3_256(b135)
        == "8094bb53c44cfb1e67b7c30447f9a1c33696d2463ecc1d9c92538913392843c9"
    )

    b136 = "a" * 136
    assert (
        sha3_256(b136)
        == "3fc5559f14db8e453a0a3091edbd2bc25e11528d81c66fa570a4efdcc2695ee1"
    )

    # Output structure and properties validation (64 hex characters / 256 bits)
    digest = sha3_256("test properties")
    assert isinstance(digest, str)
    assert len(digest) == 64
    assert all(c in "0123456789abcdef" for c in digest)

    # Unicode / multi-byte character test
    unicode_str = "Hello, 世界! 🔑 SHA3-256 🧪"
    assert (
        sha3_256(unicode_str)
        == hashlib.sha3_256(unicode_str.encode("utf-8")).hexdigest()
    )

    # compute_hash wrapper verification
    assert (
        compute_hash("abc", "sha3_256")
        == hashlib.sha3_256(b"abc").hexdigest()
    )
