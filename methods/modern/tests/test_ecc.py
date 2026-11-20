"""Unit tests for methods.modern.ecc (secp256r1 ECDH and ECDSA)."""

import pytest

from methods.modern import ecc


def test_generator_and_curve_invariants():
    assert ecc.is_on_curve(ecc.P256_G) is True
    assert ecc.is_on_curve(None) is True
    assert ecc.is_on_curve((0, 0)) is False
    assert ecc.is_on_curve((-1, ecc.P256_GY)) is False

    # Point at infinity identity and inverse
    assert ecc.point_add(ecc.P256_G, None) == ecc.P256_G
    assert ecc.point_add(None, ecc.P256_G) == ecc.P256_G
    neg_g = (ecc.P256_GX, (ecc.P256_P - ecc.P256_GY) % ecc.P256_P)
    assert ecc.point_add(ecc.P256_G, neg_g) is None

    # Doubling matches scalar_mult(2, G) and order N * G == infinity
    assert ecc.point_add(ecc.P256_G, ecc.P256_G) == ecc.scalar_mult(2, ecc.P256_G)
    assert ecc.scalar_mult(0, ecc.P256_G) is None
    assert ecc.scalar_mult(ecc.P256_N, ecc.P256_G) is None


def test_pick_keys_and_derive_public_key():
    priv, pub = ecc.pick_keys()
    assert 1 <= priv < ecc.P256_N
    assert ecc.is_on_curve(pub) is True
    assert ecc.derive_public_key(priv) == pub


def test_ecdh_shared_secret_agreement():
    alice_priv, alice_pub = ecc.pick_keys()
    bob_priv, bob_pub = ecc.pick_keys()

    alice_point, alice_secret = ecc.ecdh_shared_secret(alice_priv, bob_pub)
    bob_point, bob_secret = ecc.ecdh_shared_secret(bob_priv, alice_pub)

    assert alice_point == bob_point
    assert alice_secret == bob_secret
    assert len(alice_secret) == 64  # SHA-256 hex


def test_ecdsa_sign_and_verify_roundtrip():
    priv, pub = ecc.pick_keys()
    message = "Elliptic Curve Digital Signature Test"
    sig = ecc.ecdsa_sign(message, priv)
    assert ecc.ecdsa_verify(message, sig, pub) is True
    assert ecc.ecdsa_verify(message.encode("utf-8"), sig, pub) is True

    # Tampered message fails
    assert ecc.ecdsa_verify("Elliptic Curve Digital Signature Test!", sig, pub) is False

    # Tampered signature fails
    r_val, s_val = sig
    assert ecc.ecdsa_verify(message, (r_val, (s_val + 1) % ecc.P256_N), pub) is False

    # Wrong public key fails
    _, other_pub = ecc.pick_keys()
    assert ecc.ecdsa_verify(message, sig, other_pub) is False


def test_ecdsa_deterministic_nonce_and_bounds():
    priv = 0xC9AFA9D845BA75166B5C215767B1D6934E50C3DB36E89B127B8A622B120F6721
    pub = ecc.derive_public_key(priv)
    sig = ecc.ecdsa_sign("sample", priv, nonce_k=0xA6E3C57DD01ABE90086538398355DD4C3B17AA873382B0F24D6129493D8AAD60)
    assert ecc.ecdsa_verify("sample", sig, pub) is True

    # Out-of-range r or s returns False
    assert ecc.ecdsa_verify("sample", (0, sig[1]), pub) is False
    assert ecc.ecdsa_verify("sample", (sig[0], ecc.P256_N), pub) is False


def test_ecc_validation_errors():
    with pytest.raises(ValueError):
        ecc.derive_public_key(0)
    with pytest.raises(ValueError):
        ecc.derive_public_key(ecc.P256_N)
    with pytest.raises(TypeError):
        ecc.derive_public_key(True)  # type: ignore[arg-type]
    with pytest.raises(ValueError):
        ecc.scalar_mult(-1, ecc.P256_G)
    with pytest.raises(ValueError):
        ecc.ecdh_shared_secret(1, None)  # type: ignore[arg-type]
    with pytest.raises(ValueError):
        ecc.ecdh_shared_secret(1, (1, 2))
