"""Unit tests for Lamport OTS + Merkle Tree hash-based signatures."""

import pytest
from methods.modern.hash_signatures import (
    lamport_merkle_demo,
    merkle_keygen,
    merkle_sign,
    merkle_verify,
)


def test_lamport_merkle_demo_and_tamper():
    """Verify valid signature passes and tampered message fails."""
    res = lamport_merkle_demo("Quantum-Resistant Seal", leaf_index=2)
    assert res["valid"] is True
    assert res["tampered_valid"] is False
    assert len(res["leaf_hashes_hex"]) == 4
    assert len(res["auth_path"]) == 2
    assert res["signature_elements"] == 256


def test_merkle_tampered_root_fails():
    """Verify altering Merkle root invalidates verification."""
    tree = merkle_keygen(4)
    bundle = merkle_sign("Valid Msg", 1, tree)
    assert merkle_verify("Valid Msg", bundle, bundle["merkle_root_hex"]) is True
    bad_root = "0" * 64
    assert merkle_verify("Valid Msg", bundle, bad_root) is False


def test_lamport_merkle_validation_errors():
    """Verify invalid tree sizes, leaf indices, and empty messages raise ValueError."""
    with pytest.raises(ValueError, match="power of 2"):
        merkle_keygen(3)
    tree = merkle_keygen(4)
    with pytest.raises(ValueError, match="leaf_index"):
        merkle_sign("hi", 4, tree)
    with pytest.raises(ValueError, match="non-empty"):
        lamport_merkle_demo("")
