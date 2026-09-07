"""Unit tests for Lorenz CLI main runner."""

from unittest.mock import patch
from methods.historical.lorenz.main import run_cli


def test_run_cli_default_positions_and_valid_message(capsys):
    inputs = ["", "HELLO"]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "LORENZ SZ40/SZ42 CIPHER MACHINE SIMULATOR" in captured.out
    assert "RESULT CIPHERTEXT / PLAINTEXT:" in captured.out


def test_run_cli_custom_positions_and_valid_message(capsys):
    pos_str = "0 1 2 3 4 5 6 7 8 9 10 11"
    inputs = [pos_str, "SECRET"]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "Initial positions set: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]" in captured.out
    assert "RESULT CIPHERTEXT / PLAINTEXT:" in captured.out


def test_run_cli_wrong_number_of_positions(capsys):
    inputs = ["1 2 3 4", "TEST"]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "Warning: Expected 12 positions. Using default positions [0]*12." in captured.out
    assert "RESULT CIPHERTEXT / PLAINTEXT:" in captured.out


def test_run_cli_invalid_position_format(capsys):
    inputs = ["invalid format string", "TEST"]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "Warning: Invalid position format. Using default positions [0]*12." in captured.out
    assert "RESULT CIPHERTEXT / PLAINTEXT:" in captured.out


def test_run_cli_empty_message(capsys):
    inputs = ["", "   "]
    with patch("builtins.input", side_effect=inputs):
        run_cli()

    captured = capsys.readouterr()
    assert "No message entered. Exiting." in captured.out
