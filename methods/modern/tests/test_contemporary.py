"""Unit tests for contemporary and post-quantum cryptography module."""

import pytest
from methods.modern.contemporary import (
    SCHNORR_DEFAULT_P,
    SCHNORR_DEFAULT_Q,
    SCHNORR_DEFAULT_G,
    MLKEM_DEFAULT_Q,
    MLKEM_DEFAULT_N,
    validate_schnorr_params,
    schnorr_public_key,
    schnorr_commit,
    schnorr_challenge,
    schnorr_respond,
    schnorr_verify,
    mlkem_keygen,
    mlkem_encapsulate,
    mlkem_decapsulate,
    mlkem_demo,
)


def test_schnorr_protocol_roundtrip():
    """Test full Schnorr ZKP protocol with deterministic and random challenges."""
    secret_x = 42
    y = schnorr_public_key(secret_x)
    assert y == pow(SCHNORR_DEFAULT_G, secret_x, SCHNORR_DEFAULT_P)

    r, t = schnorr_commit(r=17)
    assert r == 17
    assert t == pow(SCHNORR_DEFAULT_G, 17, SCHNORR_DEFAULT_P)

    for c in (0, 1, 99):
        c_val = schnorr_challenge(c)
        s = schnorr_respond(r, c_val, secret_x)
        result = schnorr_verify(t, c_val, s, y)
        assert result["valid"] is True
        assert result["lhs"] == result["rhs"]


def test_schnorr_protocol_random_commit_and_challenge():
    """Test Schnorr ZKP with randomly sampled commitment and challenge."""
    secret_x = 111
    y = schnorr_public_key(secret_x)
    r, t = schnorr_commit()
    assert 1 <= r < SCHNORR_DEFAULT_Q
    c = schnorr_challenge()
    assert 0 <= c < SCHNORR_DEFAULT_Q
    s = schnorr_respond(r, c, secret_x)
    assert schnorr_verify(t, c, s, y)["valid"] is True


def test_schnorr_verify_fails_on_tampering():
    """Test Schnorr verification rejects tampered response, commitment, or wrong key."""
    secret_x = 55
    y = schnorr_public_key(secret_x)
    r, t = schnorr_commit(r=29)
    c = schnorr_challenge(13)
    s = schnorr_respond(r, c, secret_x)

    bad_s = (s + 1) % SCHNORR_DEFAULT_Q
    assert schnorr_verify(t, c, bad_s, y)["valid"] is False

    wrong_y = schnorr_public_key(secret_x + 1)
    assert schnorr_verify(t, c, s, wrong_y)["valid"] is False


def test_schnorr_validation_errors():
    """Test parameter validation for Schnorr ZKP."""
    with pytest.raises(ValueError, match="prime"):
        validate_schnorr_params(15, 7, 2)
    with pytest.raises(ValueError, match="divide"):
        validate_schnorr_params(23, 7, 2)
    with pytest.raises(ValueError, match="subgroup"):
        validate_schnorr_params(23, 11, 5)  # 5^11 mod 23 == 22 != 1
    with pytest.raises(ValueError, match="secret_x"):
        schnorr_public_key(0)
    with pytest.raises(ValueError, match="secret_x"):
        schnorr_public_key(SCHNORR_DEFAULT_Q)


def test_mlkem_keygen_encapsulate_decapsulate():
    """Test ML-KEM / LWE keygen, encapsulate, and decapsulate for bits 0 and 1."""
    keys = mlkem_keygen(n=MLKEM_DEFAULT_N, q=MLKEM_DEFAULT_Q, noise_bound=2)
    assert len(keys["A"]) == MLKEM_DEFAULT_N
    assert len(keys["t"]) == MLKEM_DEFAULT_N

    for bit in (0, 1):
        encap = mlkem_encapsulate(keys["A"], keys["t"], message_bit=bit, q=MLKEM_DEFAULT_Q, noise_bound=2)
        decap = mlkem_decapsulate(keys["s"], encap["u"], encap["v"], q=MLKEM_DEFAULT_Q)
        assert encap["message_bit"] == bit
        assert decap["recovered_bit"] == bit
        assert decap["shared_secret_hex"] == encap["shared_secret_hex"]
        assert len(decap["shared_secret_hex"]) == 64


def test_mlkem_demo_roundtrip():
    """Test end-to-end mlkem_demo helper."""
    res0 = mlkem_demo(message_bit=0, noise_bound=1)
    assert res0["match"] is True
    assert res0["decapsulation"]["recovered_bit"] == 0

    res1 = mlkem_demo(message_bit=1, noise_bound=0)
    assert res1["match"] is True
    assert res1["decapsulation"]["recovered_bit"] == 1
    assert res1["decapsulation"]["centered_diff"] == MLKEM_DEFAULT_Q // 2


def test_mlkem_validation_errors():
    """Test ML-KEM parameter validation."""
    with pytest.raises(ValueError, match="dimension n"):
        mlkem_keygen(n=1)
    with pytest.raises(ValueError, match="prime"):
        mlkem_keygen(q=100)
    with pytest.raises(ValueError, match="noise_bound"):
        mlkem_keygen(noise_bound=-1)
    keys = mlkem_keygen()
    with pytest.raises(ValueError, match="message_bit"):
        mlkem_encapsulate(keys["A"], keys["t"], message_bit=2)
