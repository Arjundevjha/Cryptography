"""Post-quantum Lamport One-Time Signatures (OTS) combined with a Merkle Tree."""

import hashlib
import secrets

DIGEST_BITS = 256


def _sha256(data: bytes) -> bytes:
    """Return raw 32-byte SHA-256 digest."""
    return hashlib.sha256(data).digest()


def _lamport_keygen() -> tuple[list[tuple[bytes, bytes]], list[tuple[bytes, bytes]]]:
    """Generate a Lamport OTS keypair (256 pairs of 32-byte values)."""
    priv: list[tuple[bytes, bytes]] = []
    pub: list[tuple[bytes, bytes]] = []
    for _ in range(DIGEST_BITS):
        sk0 = secrets.token_bytes(32)
        sk1 = secrets.token_bytes(32)
        priv.append((sk0, sk1))
        pub.append((_sha256(sk0), _sha256(sk1)))
    return priv, pub


def _lamport_pub_hash(pub: list[tuple[bytes, bytes]]) -> bytes:
    """Hash all 512 public-key values into a single 32-byte Merkle leaf."""
    hasher = hashlib.sha256()
    for pk0, pk1 in pub:
        hasher.update(pk0)
        hasher.update(pk1)
    return hasher.digest()


def _lamport_sign(message: bytes, priv: list[tuple[bytes, bytes]]) -> list[bytes]:
    """Sign message using Lamport OTS private key."""
    digest = _sha256(message)
    sig: list[bytes] = []
    for bit_idx in range(DIGEST_BITS):
        byte_val = digest[bit_idx // 8]
        bit = (byte_val >> (7 - (bit_idx % 8))) & 1
        sig.append(priv[bit_idx][bit])
    return sig


def _lamport_verify(
    message: bytes,
    signature: list[bytes],
    pub: list[tuple[bytes, bytes]],
) -> bool:
    """Verify a Lamport OTS signature against its public key."""
    if len(signature) != DIGEST_BITS or len(pub) != DIGEST_BITS:
        return False
    digest = _sha256(message)
    for bit_idx in range(DIGEST_BITS):
        byte_val = digest[bit_idx // 8]
        bit = (byte_val >> (7 - (bit_idx % 8))) & 1
        if _sha256(signature[bit_idx]) != pub[bit_idx][bit]:
            return False
    return True


def merkle_keygen(num_leaves: int = 4) -> dict:
    """Generate a Merkle tree of Lamport OTS keypairs (num_leaves must be a power of 2 >= 2)."""
    if num_leaves < 2 or (num_leaves & (num_leaves - 1)) != 0:
        raise ValueError("num_leaves must be a power of 2 >= 2")

    keypairs = [_lamport_keygen() for _ in range(num_leaves)]
    leaves = [_lamport_pub_hash(pub) for _, pub in keypairs]

    levels: list[list[bytes]] = [leaves]
    current = leaves
    while len(current) > 1:
        next_level = [
            _sha256(current[i] + current[i + 1])
            for i in range(0, len(current), 2)
        ]
        levels.append(next_level)
        current = next_level

    return {
        "root": current[0],
        "levels": levels,
        "keypairs": keypairs,
        "num_leaves": num_leaves,
    }


def merkle_sign(message: str | bytes, leaf_index: int, tree: dict) -> dict:
    """Sign message with the Lamport keypair at leaf_index and build Merkle auth path."""
    num_leaves = tree["num_leaves"]
    if not 0 <= leaf_index < num_leaves:
        raise ValueError(f"leaf_index must be in 0..{num_leaves - 1}")

    msg_bytes = message.encode("utf-8") if isinstance(message, str) else bytes(message)
    priv, pub = tree["keypairs"][leaf_index]
    signature = _lamport_sign(msg_bytes, priv)

    auth_path: list[dict] = []
    idx = leaf_index
    for level in tree["levels"][:-1]:
        sibling_idx = idx ^ 1
        position = "right" if idx % 2 == 0 else "left"
        auth_path.append({
            "position": position,
            "hash_hex": level[sibling_idx].hex(),
        })
        idx //= 2

    return {
        "leaf_index": leaf_index,
        "pub": pub,
        "signature": signature,
        "auth_path": auth_path,
        "merkle_root_hex": tree["root"].hex(),
    }


def merkle_verify(
    message: str | bytes,
    sig_bundle: dict,
    merkle_root_hex: str,
) -> bool:
    """Verify both the Lamport signature and the Merkle authentication path."""
    msg_bytes = message.encode("utf-8") if isinstance(message, str) else bytes(message)
    pub = sig_bundle["pub"]
    if not _lamport_verify(msg_bytes, sig_bundle["signature"], pub):
        return False

    current = _lamport_pub_hash(pub)
    for node in sig_bundle["auth_path"]:
        sibling = bytes.fromhex(node["hash_hex"])
        if node["position"] == "right":
            current = _sha256(current + sibling)
        else:
            current = _sha256(sibling + current)
    return current.hex() == merkle_root_hex


def lamport_merkle_demo(
    message: str,
    leaf_index: int = 0,
    tamper_message: str | None = None,
) -> dict:
    """Run an end-to-end 4-leaf Lamport + Merkle Tree signature demonstration."""
    if not isinstance(message, str) or not message:
        raise ValueError("message must be a non-empty string")
    tree = merkle_keygen(num_leaves=4)
    bundle = merkle_sign(message, leaf_index, tree)
    valid = merkle_verify(message, bundle, bundle["merkle_root_hex"])

    tamper_check_msg = tamper_message if tamper_message is not None else f"{message} (tampered)"
    tampered_valid = merkle_verify(tamper_check_msg, bundle, bundle["merkle_root_hex"])

    return {
        "merkle_root_hex": bundle["merkle_root_hex"],
        "leaf_index": leaf_index,
        "leaf_hashes_hex": [leaf.hex() for leaf in tree["levels"][0]],
        "auth_path": bundle["auth_path"],
        "message_digest_hex": _sha256(message.encode("utf-8")).hex(),
        "signature_sample_hex": [s.hex() for s in bundle["signature"][:4]],
        "signature_elements": len(bundle["signature"]),
        "valid": valid,
        "tampered_valid": tampered_valid,
    }
