"""Unit tests for Lorenz CLI main runner."""

from unittest.mock import patch
import runpy
from methods.historical.lorenz.main import run_cli


def test_run_cli_default_positions_and_valid_message(capsys):
    """Test run_cli with default positions and a valid message."""
    inputs = ["", "HELLO"]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "LORENZ SZ40/SZ42 CIPHER MACHINE SIMULATOR" in captured.out
    assert "RESULT CIPHERTEXT / PLAINTEXT:" in captured.out
    assert "HVLLO" in captured.out


def test_main_module_execution(capsys):
    """Test the lorenz main module when executed as __main__."""
    inputs = ["", "HELLO"]
    with patch("builtins.input", side_effect=inputs):
        runpy.run_module("methods.historical.lorenz.main", run_name="__main__")

    captured = capsys.readouterr()
    assert "LORENZ SZ40/SZ42 CIPHER MACHINE SIMULATOR" in captured.out
    assert "HVLLO" in captured.out


def test_run_cli_custom_positions_and_valid_message(capsys):
    """Test run_cli with all 12 positions set and a valid message."""
    pos_str = "0 1 2 3 4 5 6 7 8 9 10 11"
    inputs = [pos_str, "SECRET"]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "Initial positions set: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]" in captured.out
    assert "RESULT CIPHERTEXT / PLAINTEXT:" in captured.out


def test_run_cli_wrong_number_of_positions(capsys):
    """Test that run_cli warns when fewer than 12 positions are given."""
    inputs = ["1 2 3 4", "TEST"]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "Warning: Expected 12 positions. Using default positions [0]*12." in captured.out
    assert "RESULT CIPHERTEXT / PLAINTEXT:" in captured.out


def test_run_cli_invalid_position_format(capsys):
    """Test that run_cli warns when position input cannot be parsed."""
    inputs = ["invalid format string", "TEST"]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "Warning: Invalid position format. Using default positions [0]*12." in captured.out
    assert "RESULT CIPHERTEXT / PLAINTEXT:" in captured.out


def test_run_cli_empty_message(capsys):
    """Test that run_cli reports when the message is empty."""
    inputs = ["", "   "]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "No message entered. Exiting." in captured.out


def test_run_cli_roundtrip_encipher_decipher(capsys):
    """Test that run_cli round-trips encipher then decipher for the same key."""
    pos_str = "0 1 2 3 4 5 6 7 8 9 10 11"
    # First pass: encipher message
    inputs1 = [pos_str, "SECRET"]
    with patch("builtins.input", side_effect=inputs1):
        run_cli()
    captured1 = capsys.readouterr().out
    ciphertext = captured1.split("RESULT CIPHERTEXT / PLAINTEXT:\n")[1].split("\n-")[0].strip()

    # Second pass: decipher ciphertext using identical initial positions
    inputs2 = [pos_str, ciphertext]
    with patch("builtins.input", side_effect=inputs2):
        run_cli()
    captured2 = capsys.readouterr().out
    decrypted = captured2.split("RESULT CIPHERTEXT / PLAINTEXT:\n")[1].split("\n-")[0].strip()

    assert decrypted == "SECRET"


def test_run_cli_lowercase_message_input(capsys):
    """Test that run_cli handles lowercase input (case-insensitive encryption)."""
    inputs = ["", "hello world"]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "RESULT CIPHERTEXT / PLAINTEXT:" in captured.out


def test_run_cli_float_position_input(capsys):
    """Test that run_cli rejects float positions with a warning."""
    inputs = ["0 1.5 2 3 4 5 6 7 8 9 10 11", "TEST"]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "Warning: Invalid position format. Using default positions [0]*12." in captured.out


def test_run_cli_positions_with_extra_whitespace(capsys):
    """Test that run_cli strips extra whitespace in position input."""
    pos_str = "  0   1 2  3 4 5 6 7 8 9 10  11  "
    inputs = [pos_str, "TEST"]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "Initial positions set: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]" in captured.out
