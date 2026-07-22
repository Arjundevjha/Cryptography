"""Main simulation runner and interactive CLI for the Lorenz SZ40/SZ42 machine."""

from .lorenz import Lorenz


def run_cli():
    """Run interactive Lorenz machine cipher CLI session."""
    print("=" * 60)
    print("      LORENZ SZ40/SZ42 CIPHER MACHINE SIMULATOR")
    print("=" * 60)

    lorenz = Lorenz()

    print("\nDefault Pinwheels Loaded:")
    print("  Chi wheels (5):  Sizes 41, 31, 29, 26, 23")
    print("  Motor wheels (2): Sizes 61, 37")
    print("  Psi wheels (5):  Sizes 43, 47, 51, 53, 59")

    # Set starting positions
    pos_input = input("\nEnter initial positions (12 numbers 0-indexed separated by spaces, or press Enter for default 0s): ").strip()
    if pos_input:
        try:
            positions = [int(p) for p in pos_input.split()]
            if len(positions) == 12:
                lorenz.set_positions(positions)
                print(f"Initial positions set: {positions}")
            else:
                print("Warning: Expected 12 positions. Using default positions [0]*12.")
        except ValueError:
            print("Warning: Invalid position format. Using default positions [0]*12.")

    # Encipher/Decipher message
    message = input("\nEnter message to encipher/decipher: ").strip().upper()
    if not message:
        print("No message entered. Exiting.")
        return

    processed = lorenz.process_message(message)
    print("\n" + "-" * 60)
    print("RESULT CIPHERTEXT / PLAINTEXT:")
    print(processed)
    print("-" * 60)


if __name__ == "__main__":
    run_cli()
