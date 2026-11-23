"""Unit tests for modern cryptanalysis engines (AES-CBC Bit-Flipping & RSA Small Factoring)."""

import pytest

from methods.modern.cryptanalysis import cbc_bitflip_attack, rsa_factor_small


def test_cbc_bitflip_attack_forges_admin():
    """Test the CBC bit-flipping attack forges the target plaintext into admin."""
    result = cbc_bitflip_attack(
        plaintext="user=alice;role=guest;pad=1",
        target_from="guest",
        target_to="admin",
    )
    assert result["forged_successfully"] is True
    assert "admin" in result["decrypted_text"]
    assert len(result["flipped_positions"]) == 5
    # Block 0 was modified in ciphertext to forge Block 1
    statuses = [blk["status"] for blk in result["decrypted_blocks"]]
    assert statuses[0] == "corrupted"
    assert statuses[1] == "forged"
    assert result["original_blocks_hex"][0] != result["tampered_blocks_hex"][0]
    assert result["original_blocks_hex"][1] == result["tampered_blocks_hex"][1]


def test_cbc_bitflip_attack_iv_target_block0():
    """Test the bit-flip attack when the target lands in block 0 (IV tamper path)."""
    result = cbc_bitflip_attack(
        plaintext="role=guest;user=alice",
        target_from="guest",
        target_to="admin",
    )
    assert result["forged_successfully"] is True
    assert result["iv_hex"] != result["tampered_iv_hex"]
    assert result["decrypted_blocks"][0]["status"] == "forged"


def test_cbc_bitflip_attack_validation():
    """Test that bit-flip attack validates mismatched target strings and found-substrings."""
    with pytest.raises(ValueError):
        cbc_bitflip_attack("user=alice;role=guest", "guest", "superuser")
    with pytest.raises(ValueError):
        cbc_bitflip_attack("user=alice;role=member", "guest", "admin")


def test_rsa_factor_small_both_methods():
    """Test rsa_factor_small with close primes using both Fermat and Pollard rho."""
    # Close primes -> Fermat is very fast; Pollard rho also works
    p, q = 10007, 10037
    n = p * q
    e = 65537
    result = rsa_factor_small(n, e=e, method="both")
    assert result["p"] == p
    assert result["q"] == q
    assert result["phi"] == (p - 1) * (q - 1)
    assert result["d"] is not None
    assert (e * result["d"]) % result["phi"] == 1
    assert result["fermat"]["found"] is True
    assert result["pollard_rho"]["found"] is True


def test_rsa_factor_small_40bit_pollard_rho():
    """Test rsa_factor_small on a 40-bit modulus using Pollard rho."""
    # 20-bit primes -> ~40-bit modulus
    p, q = 1048583, 1048601
    n = p * q
    result = rsa_factor_small(n, e=65537, method="pollard_rho")
    assert result["p"] == p
    assert result["q"] == q
    assert result["fermat"] is None
    assert result["pollard_rho"]["found"] is True


def test_rsa_factor_small_validation():
    """Test that rsa_factor_small validates its inputs."""
    with pytest.raises(ValueError):
        rsa_factor_small(3)
    with pytest.raises(ValueError):
        rsa_factor_small((1 << 65) + 1)
    with pytest.raises(ValueError):
        rsa_factor_small(15, method="unknown")
