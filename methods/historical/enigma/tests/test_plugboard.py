import pytest
from methods.historical.enigma.plugboard import Plugboard

def test_plugboard_no_pairs():
    """Test plugboard with no pairs."""
    pb = Plugboard([])

    # Check that all signals map to themselves
    for i in range(26):
        assert pb.forward(i) == i
        assert pb.backwards(i) == i

def test_plugboard_single_pair():
    """Test plugboard with a single pair."""
    pb = Plugboard(["AB"])

    # A (0) and B (1) should swap
    assert pb.forward(0) == 1
    assert pb.forward(1) == 0
    assert pb.backwards(0) == 1
    assert pb.backwards(1) == 0

    # C (2) should remain C (2)
    assert pb.forward(2) == 2
    assert pb.backwards(2) == 2

def test_plugboard_multiple_pairs():
    """Test plugboard with multiple pairs."""
    pb = Plugboard(["AB", "CD", "YZ"])

    # A (0) <-> B (1)
    assert pb.forward(0) == 1
    assert pb.forward(1) == 0
    assert pb.backwards(0) == 1
    assert pb.backwards(1) == 0

    # C (2) <-> D (3)
    assert pb.forward(2) == 3
    assert pb.forward(3) == 2
    assert pb.backwards(2) == 3
    assert pb.backwards(3) == 2

    # Y (24) <-> Z (25)
    assert pb.forward(24) == 25
    assert pb.forward(25) == 24
    assert pb.backwards(24) == 25
    assert pb.backwards(25) == 24

    # E (4) should remain E (4)
    assert pb.forward(4) == 4
    assert pb.backwards(4) == 4
