# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: modern.spec.ts >> Modern Ciphers E2E Tests >> TC-T1-RSA-05 (Formula Visualization)
- Location: tests/e2e/modern.spec.ts:221:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="visualizer-rsa"]').locator('text=n = p, text=d, svg, div').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="visualizer-rsa"]').locator('text=n = p, text=d, svg, div').first()

```

```yaml
- banner:
  - heading "🔒 Cryptography Museum" [level=1]
  - navigation:
    - link "Classical":
      - /url: "#"
    - link "Historical":
      - /url: "#"
    - link "Modern":
      - /url: "#"
- main:
  - navigation "Chronological Timeline":
    - button "Caesar Cipher (50 BC)"
    - button "Vigenère (1553)"
    - button "Affine Cipher (Math)"
    - button "Scytale"
    - button "Polybius Square"
    - button "Enigma Machine"
    - button "AES Standard"
    - button "RSA Standard"
    - button "SHA-256 Hash"
  - heading "🔒 Cryptography Museum" [level=2]
  - paragraph: Interact with classical substitution ciphers, historical enigma machine emulators, and modern cryptographic standards.
  - heading "Caesar Cipher" [level=3]
  - paragraph: A basic shift cipher where each letter is replaced by a letter some fixed number of positions down the alphabet.
  - text: Input Text (Max 500 Chars)
  - textbox "Input Text (Max 500 Chars)":
    - /placeholder: Enter secret message...
  - text: Shift Amount
  - textbox "Shift Amount": "3"
  - text: Mode Select
  - combobox "Mode Select":
    - option "Encrypt" [selected]
    - option "Decrypt"
  - button "Encrypt Mode"
  - button "Decrypt Mode"
  - text: Output Text
  - heading "Concentric Wheel Visualizer" [level=4]
  - button "Step Backward": ⏮
  - button "Play"
  - button "Step Forward": ⏭
  - button "Reset": 🔄
  - text: "Speed:"
  - slider "Speed:": "1000"
  - text: 1000ms
  - heading "Vigenère Cipher" [level=3]
  - paragraph: A polyalphabetic substitution cipher that shifts text letters using a keyword cycled repeatedly.
  - text: Input Text (Max 500 Chars)
  - textbox "Input Text (Max 500 Chars)":
    - /placeholder: Enter secret message...
  - text: Keyword
  - textbox "Keyword": LEMON
  - text: Mode Select
  - combobox "Mode Select":
    - option "Encrypt" [selected]
    - option "Decrypt"
  - button "Encrypt Mode"
  - button "Decrypt Mode"
  - text: Output Text
  - heading "Vigenère Square (Tabula Recta)" [level=4]
  - table:
    - rowgroup:
      - row "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z":
        - columnheader
        - columnheader "A"
        - columnheader "B"
        - columnheader "C"
        - columnheader "D"
        - columnheader "E"
        - columnheader "F"
        - columnheader "G"
        - columnheader "H"
        - columnheader "I"
        - columnheader "J"
        - columnheader "K"
        - columnheader "L"
        - columnheader "M"
        - columnheader "N"
        - columnheader "O"
        - columnheader "P"
        - columnheader "Q"
        - columnheader "R"
        - columnheader "S"
        - columnheader "T"
        - columnheader "U"
        - columnheader "V"
        - columnheader "W"
        - columnheader "X"
        - columnheader "Y"
        - columnheader "Z"
    - rowgroup:
      - row "A A B C D E F G H I J K L M N O P Q R S T U V W X Y Z":
        - cell "A"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
      - row "B B C D E F G H I J K L M N O P Q R S T U V W X Y Z A":
        - cell "B"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
      - row "C C D E F G H I J K L M N O P Q R S T U V W X Y Z A B":
        - cell "C"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
      - row "D D E F G H I J K L M N O P Q R S T U V W X Y Z A B C":
        - cell "D"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
      - row "E E F G H I J K L M N O P Q R S T U V W X Y Z A B C D":
        - cell "E"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
      - row "F F G H I J K L M N O P Q R S T U V W X Y Z A B C D E":
        - cell "F"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
      - row "G G H I J K L M N O P Q R S T U V W X Y Z A B C D E F":
        - cell "G"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
      - row "H H I J K L M N O P Q R S T U V W X Y Z A B C D E F G":
        - cell "H"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
      - row "I I J K L M N O P Q R S T U V W X Y Z A B C D E F G H":
        - cell "I"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
      - row "J J K L M N O P Q R S T U V W X Y Z A B C D E F G H I":
        - cell "J"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
      - row "K K L M N O P Q R S T U V W X Y Z A B C D E F G H I J":
        - cell "K"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
      - row "L L M N O P Q R S T U V W X Y Z A B C D E F G H I J K":
        - cell "L"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
      - row "M M N O P Q R S T U V W X Y Z A B C D E F G H I J K L":
        - cell "M"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
      - row "N N O P Q R S T U V W X Y Z A B C D E F G H I J K L M":
        - cell "N"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
      - row "O O P Q R S T U V W X Y Z A B C D E F G H I J K L M N":
        - cell "O"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
      - row "P P Q R S T U V W X Y Z A B C D E F G H I J K L M N O":
        - cell "P"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
      - row "Q Q R S T U V W X Y Z A B C D E F G H I J K L M N O P":
        - cell "Q"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
      - row "R R S T U V W X Y Z A B C D E F G H I J K L M N O P Q":
        - cell "R"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
      - row "S S T U V W X Y Z A B C D E F G H I J K L M N O P Q R":
        - cell "S"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
      - row "T T U V W X Y Z A B C D E F G H I J K L M N O P Q R S":
        - cell "T"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
      - row "U U V W X Y Z A B C D E F G H I J K L M N O P Q R S T":
        - cell "U"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
      - row "V V W X Y Z A B C D E F G H I J K L M N O P Q R S T U":
        - cell "V"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
      - row "W W X Y Z A B C D E F G H I J K L M N O P Q R S T U V":
        - cell "W"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
      - row "X X Y Z A B C D E F G H I J K L M N O P Q R S T U V W":
        - cell "X"
        - cell "X"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
      - row "Y Y Z A B C D E F G H I J K L M N O P Q R S T U V W X":
        - cell "Y"
        - cell "Y"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
      - row "Z Z A B C D E F G H I J K L M N O P Q R S T U V W X Y":
        - cell "Z"
        - cell "Z"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "J"
        - cell "K"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
  - button "Step Backward": ⏮
  - button "Play"
  - button "Step Forward": ⏭
  - button "Reset": 🔄
  - text: "Speed:"
  - slider "Speed:": "1000"
  - text: 1000ms
  - heading "Affine Cipher" [level=3]
  - paragraph: "A mathematical substitution cipher where each letter is mapped to its numeric equivalent, encrypted via the formula: E(x) = (ax + b) mod 26."
  - text: Input Text (Max 500 Chars)
  - textbox "Input Text (Max 500 Chars)":
    - /placeholder: Enter secret message...
  - text: Key a
  - textbox "Key a": "5"
  - text: Key b
  - textbox "Key b": "8"
  - text: Mode Select
  - combobox "Mode Select":
    - option "Encrypt" [selected]
    - option "Decrypt"
  - button "Encrypt Mode"
  - button "Decrypt Mode"
  - text: Output Text
  - heading "Mathematical Formula Visualizer" [level=4]
  - text: E(x) = (5x + 8) mod 26 E(0) = (5 × 0 + 8) mod 26 = 8
  - button "Step Backward": ⏮
  - button "Play"
  - button "Step Forward": ⏭
  - button "Reset": 🔄
  - text: "Speed:"
  - slider "Speed:": "1000"
  - text: 1000ms
  - heading "Scytale Cipher" [level=3]
  - paragraph: A transposition cipher used by the ancient Greeks, consisting of a cylinder with a strip of parchment wrapped around it.
  - text: Input Text (Max 500 Chars)
  - textbox "Input Text (Max 500 Chars)":
    - /placeholder: Enter secret message...
  - text: Cylinder Width (Diameter)
  - textbox "Cylinder Width (Diameter)": "4"
  - text: Action
  - button "Encrypt"
  - button "Decrypt"
  - text: "Step: 1 / 1"
  - button "Step Backward" [disabled]: ⏮️
  - button "Play": ▶️
  - button "Step Forward" [disabled]: ⏭️
  - button "Reset": 🔄
  - text: Speed
  - slider "Speed": "1000"
  - text: 1000ms
  - img
  - text: Output Text
  - heading "Polybius Square" [level=3]
  - paragraph: A device invented by the ancient Greeks for fractionating letters into grid coordinates (1-5 for rows and columns).
  - text: Input Text (Max 500 Chars)
  - textbox "Input Text (Max 500 Chars)":
    - /placeholder: Enter message (letters for encrypt, coordinate pairs for decrypt)...
  - text: Grid Key (25 letters)
  - textbox "Grid Key (25 letters)": abcdefghiklmnopqrstuvwxyz
  - text: Action
  - button "Encrypt"
  - button "Decrypt"
  - text: "Step: 1 / 1"
  - button "Step Backward" [disabled]: ⏮️
  - button "Play": ▶️
  - button "Step Forward" [disabled]: ⏭️
  - button "Reset": 🔄
  - text: Speed
  - slider "Speed": "1000"
  - text: 1000ms
  - table:
    - rowgroup:
      - row "1 2 3 4 5":
        - columnheader
        - columnheader "1"
        - columnheader "2"
        - columnheader "3"
        - columnheader "4"
        - columnheader "5"
    - rowgroup:
      - row "1 A B C D E":
        - rowheader "1"
        - cell "A"
        - cell "B"
        - cell "C"
        - cell "D"
        - cell "E"
      - row "2 F G H I K":
        - rowheader "2"
        - cell "F"
        - cell "G"
        - cell "H"
        - cell "I"
        - cell "K"
      - row "3 L M N O P":
        - rowheader "3"
        - cell "L"
        - cell "M"
        - cell "N"
        - cell "O"
        - cell "P"
      - row "4 Q R S T U":
        - rowheader "4"
        - cell "Q"
        - cell "R"
        - cell "S"
        - cell "T"
        - cell "U"
      - row "5 V W X Y Z":
        - rowheader "5"
        - cell "V"
        - cell "W"
        - cell "X"
        - cell "Y"
        - cell "Z"
  - text: Output Text
  - heading "Enigma Machine" [level=3]
  - paragraph: The legendary electro-mechanical rotor cipher machine used in WWII, featuring configurable rotors, ring settings, and plugboard connections.
  - text: Input Text (Max 500 Chars)
  - textbox "Input Text (Max 500 Chars)":
    - /placeholder: Enter message to encipher (A-Z only)...
  - text: Rotors (e.g. I-II-III)
  - textbox "Rotors (e.g. I-II-III)": I-II-III
  - text: Initial Positions (e.g. A-A-A)
  - textbox "Initial Positions (e.g. A-A-A)": A-A-A
  - text: Ring Settings (e.g. A-A-A or 1-1-1)
  - textbox "Ring Settings (e.g. A-A-A or 1-1-1)": A-A-A
  - text: Plugboard Swaps (e.g. AB CD)
  - textbox "Plugboard Swaps (e.g. AB CD)"
  - button "Encipher Message"
  - text: "Step: 1 / 1"
  - button "Step Backward" [disabled]: ⏮️
  - button "Play": ▶️
  - button "Step Forward" [disabled]: ⏭️
  - button "Reset": 🔄
  - text: Speed
  - slider "Speed": "1000"
  - text: 1000ms
  - img: REFL ROTOR 1 (A) ROTOR 2 (A) ROTOR 3 (A) PLUG/KB
  - text: Output Text
  - heading "AES Cipher" [level=3]
  - paragraph: Advanced Encryption Standard (AES-256 CTR Mode)
  - combobox:
    - option "Encrypt Mode" [selected]
    - option "Decrypt Mode"
  - text: Input String
  - textbox "Input String":
    - /placeholder: Enter text or hex to encrypt/decrypt...
  - text: Input Format
  - combobox "Input Format":
    - option "Plain Text" [selected]
    - option "Hexadecimal"
  - text: Key Format
  - combobox "Key Format":
    - option "Plain Text" [selected]
    - option "Hexadecimal"
  - text: Cipher Key (16 or 32 bytes)
  - textbox "Cipher Key (16 or 32 bytes)": "1234567890123456"
  - button "Encrypt"
  - button "Decrypt"
  - text: "Round: 0 / 10"
  - button "Step Backward" [disabled]: ⏮️
  - button "Play": ▶️
  - button "Step Forward": ⏭️
  - button "Reset": 🔄
  - text: Speed
  - slider "Speed": "1000"
  - text: "1000ms AES-256 CTR Block Diagram & Visualizer Round 0 Operation: AddRoundKey (Pre-round) 1. Key Expansion (generating round keys 0-10) 2. SubBytes: S-Box non-linear byte substitution 3. ShiftRows: Cyclic shift of rows in state matrix 4. MixColumns: Column transformation in GF(2^8) 5. AddRoundKey: XOR with round key W[0..3]"
  - img: Plaintext AES CTR Round 0 Counter + Nonce Output
  - text: Output Text
  - heading "RSA Cipher" [level=3]
  - paragraph: Asymmetric Cryptography (Modular Exponentiation)
  - combobox:
    - option "Encrypt Mode" [selected]
    - option "Decrypt Mode"
  - text: Key Generation Panel Prime p
  - spinbutton "Prime p": "61"
  - text: Prime q
  - spinbutton "Prime q": "53"
  - text: Exponent e
  - spinbutton "Exponent e": "65537"
  - button "Generate RSA Keys"
  - text: "Modulus (n): Public Key (PEM): Input Message (Number or Text)"
  - textbox "Input Message (Number or Text)":
    - /placeholder: Enter message to encrypt or decrypt...
  - button "Encrypt"
  - button "Decrypt"
  - text: "Step: 1 / 5"
  - button "Step Backward" [disabled]: ⏮️
  - button "Play": ▶️
  - button "Step Forward": ⏭️
  - button "Reset": 🔄
  - text: Speed
  - slider "Speed": "1000"
  - text: "1000ms RSA Mathematical Flow & Diagram Step 1: Choose Primes"
  - paragraph: "Select distinct prime numbers: p = 61, q = 53"
  - text: "Step 2: Modulus & Totient"
  - paragraph: n = p * q = ? phi(n) = (p-1)*(q-1) = ?
  - text: "Step 3: Keys Exponent"
  - paragraph: Public e = 65537 Private d = e⁻¹ mod phi = ?
  - text: "Step 4: Encryption"
  - paragraph: Cipher C = M^e mod n
  - text: "Modulus definition: n = p * q Totient Relation: d * e ≡ 1 (mod phi) Decryption Relation: M = C^d mod n"
  - img: Message (M) exponentiation mod n Cipher (C)
  - text: Output Text
  - heading "SHA-256 Hash" [level=3]
  - paragraph: Cryptographic Secure Hash Algorithm (256-bit Digest)
  - text: Input Plaintext
  - textbox "Input Plaintext":
    - /placeholder: Enter text to hash...
  - button "Hash (encrypt-btn)"
  - button "Compute SHA-256"
  - text: "Step: 1 / 4"
  - button "Step Backward" [disabled]: ⏮️
  - button "Play": ▶️
  - button "Step Forward": ⏭️
  - button "Reset": 🔄
  - text: Speed
  - slider "Speed": "1000"
  - text: "1000ms SHA-256 Block & Message Padding representation Message length: 0 bits Padding added (1 + zeros): pad 1 bit + 447 zero bits Total Padded size: 512 bits (1 blocks) Message Blocks: Block 1"
  - img: Message Padding (pad, 1) 64-bit length suffix Hash Digest
  - text: Output Hash
- contentinfo:
  - paragraph: © 2026 Cryptography Museum. Educational tool only.
- alert
```

# Test source

```ts
  127 |     await page.fill('[data-testid="param-key-aes"]', '1234567890123456');
  128 |     
  129 |     const errorMsg = page.locator('[data-testid="error-message-aes"]');
  130 |     await expect(errorMsg).toBeVisible();
  131 |   });
  132 | 
  133 |   test('TC-T2-AES-05 (Invalid Ciphertext Decryption)', async ({ page }) => {
  134 |     await page.fill('[data-testid="input-text-aes"]', 'InvalidHexFormat!');
  135 |     await page.fill('[data-testid="param-key-aes"]', '1234567890123456');
  136 |     
  137 |     const decryptBtn = page.locator('[data-testid="decrypt-btn-aes"]');
  138 |     if (await decryptBtn.count() > 0) {
  139 |       await decryptBtn.click();
  140 |     } else {
  141 |       const modeSelect = page.locator('[data-testid="mode-select-aes"]');
  142 |       if (await modeSelect.count() > 0) {
  143 |         await modeSelect.selectOption('decrypt');
  144 |       }
  145 |     }
  146 |     
  147 |     const errorMsg = page.locator('[data-testid="error-message-aes"]');
  148 |     await expect(errorMsg).toBeVisible();
  149 |   });
  150 | 
  151 |   // ==========================================
  152 |   // RSA CIPHER
  153 |   // ==========================================
  154 | 
  155 |   test('TC-T1-RSA-01 (Keypair Gen)', async ({ page }) => {
  156 |     await page.fill('[data-testid="param-p-rsa"]', '61');
  157 |     await page.fill('[data-testid="param-q-rsa"]', '53');
  158 |     
  159 |     const genBtn = page.locator('[data-testid="generate-keys-btn-rsa"]');
  160 |     if (await genBtn.count() > 0) {
  161 |       await genBtn.click();
  162 |     }
  163 |     
  164 |     await expect(page.locator('[data-testid="param-n-rsa"]')).not.toBeEmpty();
  165 |     await expect(page.locator('[data-testid="public-key-rsa"]')).not.toBeEmpty();
  166 |   });
  167 | 
  168 |   test('TC-T1-RSA-02 (Encrypt Message)', async ({ page }) => {
  169 |     await page.fill('[data-testid="param-p-rsa"]', '61');
  170 |     await page.fill('[data-testid="param-q-rsa"]', '53');
  171 |     const genBtn = page.locator('[data-testid="generate-keys-btn-rsa"]');
  172 |     if (await genBtn.count() > 0) { await genBtn.click(); }
  173 |     
  174 |     await page.fill('[data-testid="input-text-rsa"]', '42');
  175 |     const encryptBtn = page.locator('[data-testid="encrypt-btn-rsa"]');
  176 |     if (await encryptBtn.count() > 0) {
  177 |       await encryptBtn.click();
  178 |     } else {
  179 |       const modeSelect = page.locator('[data-testid="mode-select-rsa"]');
  180 |       if (await modeSelect.count() > 0) { await modeSelect.selectOption('encrypt'); }
  181 |     }
  182 |     
  183 |     await expect(page.locator('[data-testid="output-text-rsa"]')).not.toBeEmpty();
  184 |   });
  185 | 
  186 |   test('TC-T1-RSA-03 (Decrypt Ciphertext)', async ({ page }) => {
  187 |     await page.fill('[data-testid="param-p-rsa"]', '61');
  188 |     await page.fill('[data-testid="param-q-rsa"]', '53');
  189 |     const genBtn = page.locator('[data-testid="generate-keys-btn-rsa"]');
  190 |     if (await genBtn.count() > 0) { await genBtn.click(); }
  191 |     
  192 |     await page.fill('[data-testid="input-text-rsa"]', '42');
  193 |     const encryptBtn = page.locator('[data-testid="encrypt-btn-rsa"]');
  194 |     if (await encryptBtn.count() > 0) { await encryptBtn.click(); }
  195 |     const ciphertext = await page.locator('[data-testid="output-text-rsa"]').textContent();
  196 |     
  197 |     await page.fill('[data-testid="input-text-rsa"]', ciphertext || '');
  198 |     const decryptBtn = page.locator('[data-testid="decrypt-btn-rsa"]');
  199 |     if (await decryptBtn.count() > 0) {
  200 |       await decryptBtn.click();
  201 |     } else {
  202 |       const modeSelect = page.locator('[data-testid="mode-select-rsa"]');
  203 |       if (await modeSelect.count() > 0) { await modeSelect.selectOption('decrypt'); }
  204 |     }
  205 |     
  206 |     await expect(page.locator('[data-testid="output-text-rsa"]')).toHaveText('42');
  207 |   });
  208 | 
  209 |   test('TC-T1-RSA-04 (Custom e Selection)', async ({ page }) => {
  210 |     await page.fill('[data-testid="param-p-rsa"]', '61');
  211 |     await page.fill('[data-testid="param-q-rsa"]', '53');
  212 |     await page.fill('[data-testid="param-e-rsa"]', '17');
  213 |     
  214 |     const genBtn = page.locator('[data-testid="generate-keys-btn-rsa"]');
  215 |     if (await genBtn.count() > 0) { await genBtn.click(); }
  216 |     
  217 |     const errorMsg = page.locator('[data-testid="error-message-rsa"]');
  218 |     await expect(errorMsg).not.toBeVisible();
  219 |   });
  220 | 
  221 |   test('TC-T1-RSA-05 (Formula Visualization)', async ({ page }) => {
  222 |     await page.fill('[data-testid="param-p-rsa"]', '61');
  223 |     await page.fill('[data-testid="param-q-rsa"]', '53');
  224 |     
  225 |     const visualizer = page.locator('[data-testid="visualizer-rsa"]');
  226 |     await expect(visualizer).toBeVisible();
> 227 |     await expect(visualizer.locator('text=n = p, text=d, svg, div').first()).toBeVisible();
      |                                                                              ^ Error: expect(locator).toBeVisible() failed
  228 |   });
  229 | 
  230 |   test('TC-T2-RSA-01 (Non-Prime Parameters)', async ({ page }) => {
  231 |     await page.fill('[data-testid="param-p-rsa"]', '4');
  232 |     await page.fill('[data-testid="param-q-rsa"]', '53');
  233 |     
  234 |     const errorMsg = page.locator('[data-testid="error-message-rsa"]');
  235 |     await expect(errorMsg).toBeVisible();
  236 |   });
  237 | 
  238 |   test('TC-T2-RSA-02 (Primes Too Small)', async ({ page }) => {
  239 |     await page.fill('[data-testid="param-p-rsa"]', '2');
  240 |     await page.fill('[data-testid="param-q-rsa"]', '3');
  241 |     
  242 |     const errorMsg = page.locator('[data-testid="error-message-rsa"]');
  243 |     await expect(errorMsg).toBeVisible();
  244 |   });
  245 | 
  246 |   test('TC-T2-RSA-03 (Coprimality Violation for e)', async ({ page }) => {
  247 |     await page.fill('[data-testid="param-p-rsa"]', '61');
  248 |     await page.fill('[data-testid="param-q-rsa"]', '53');
  249 |     await page.fill('[data-testid="param-e-rsa"]', '13'); // 13 is not coprime to phi(n)=3120 (13*240 = 3120)
  250 |     
  251 |     const errorMsg = page.locator('[data-testid="error-message-rsa"]');
  252 |     await expect(errorMsg).toBeVisible();
  253 |   });
  254 | 
  255 |   test('TC-T2-RSA-04 (Empty Input Validation)', async ({ page }) => {
  256 |     await page.fill('[data-testid="input-text-rsa"]', '');
  257 |     
  258 |     const errorMsg = page.locator('[data-testid="error-message-rsa"]');
  259 |     await expect(errorMsg).not.toBeVisible();
  260 |     await expect(page.locator('[data-testid="output-text-rsa"]')).toHaveText('');
  261 |   });
  262 | 
  263 |   test('TC-T2-RSA-05 (Max Length Bound)', async ({ page }) => {
  264 |     const invalidText = 'a'.repeat(501);
  265 |     await page.fill('[data-testid="input-text-rsa"]', invalidText);
  266 |     
  267 |     const errorMsg = page.locator('[data-testid="error-message-rsa"]');
  268 |     await expect(errorMsg).toBeVisible();
  269 |   });
  270 | 
  271 |   // ==========================================
  272 |   // SHA-256 CIPHER
  273 |   // ==========================================
  274 | 
  275 |   test('TC-T1-SHA256-01 (Hash Empty String)', async ({ page }) => {
  276 |     await page.fill('[data-testid="input-text-sha256"]', '');
  277 |     
  278 |     const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
  279 |     if (await hashBtn.count() > 0) {
  280 |       await hashBtn.click();
  281 |     }
  282 |     
  283 |     await expect(page.locator('[data-testid="output-text-sha256"]'))
  284 |       .toHaveText('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  285 |   });
  286 | 
  287 |   test('TC-T1-SHA256-02 (Hash Text)', async ({ page }) => {
  288 |     await page.fill('[data-testid="input-text-sha256"]', 'hello');
  289 |     
  290 |     const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
  291 |     if (await hashBtn.count() > 0) {
  292 |       await hashBtn.click();
  293 |     }
  294 |     
  295 |     await expect(page.locator('[data-testid="output-text-sha256"]'))
  296 |       .toHaveText('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  297 |   });
  298 | 
  299 |   test('TC-T1-SHA256-03 (Varying Case Hash)', async ({ page }) => {
  300 |     await page.fill('[data-testid="input-text-sha256"]', 'Hello');
  301 |     const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
  302 |     if (await hashBtn.count() > 0) { await hashBtn.click(); }
  303 |     const outputLocator = page.locator('[data-testid="output-text-sha256"]');
  304 |     await expect(outputLocator).not.toBeEmpty();
  305 |     const hash1 = await outputLocator.textContent();
  306 |     
  307 |     await page.fill('[data-testid="input-text-sha256"]', 'hello');
  308 |     if (await hashBtn.count() > 0) { await hashBtn.click(); }
  309 |     await expect(outputLocator).not.toBeEmpty();
  310 |     const hash2 = await outputLocator.textContent();
  311 |     
  312 |     expect(hash1).not.toEqual(hash2);
  313 |   });
  314 | 
  315 |   test('TC-T1-SHA256-04 (Padding Visual Representation)', async ({ page }) => {
  316 |     await page.fill('[data-testid="input-text-sha256"]', 'A');
  317 |     
  318 |     const visualizer = page.locator('[data-testid="visualizer-sha256"]');
  319 |     await expect(visualizer).toBeVisible();
  320 |     await expect(visualizer.locator('text=pad, text=1, svg, div').first()).toBeVisible();
  321 |   });
  322 | 
  323 |   test('TC-T1-SHA256-05 (Block Splitting)', async ({ page }) => {
  324 |     const longText = 'a'.repeat(70); // > 64 bytes
  325 |     await page.fill('[data-testid="input-text-sha256"]', longText);
  326 |     
  327 |     const visualizer = page.locator('[data-testid="visualizer-sha256"]');
```