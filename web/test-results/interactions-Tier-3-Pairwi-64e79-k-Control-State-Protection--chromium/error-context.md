# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactions.spec.ts >> Tier 3: Pairwise Interactions & Visual Integration E2E Tests >> TC-T3-INTERACT-13 (Playback Control State Protection)
- Location: tests/e2e/interactions.spec.ts:200:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="play-btn-caesar"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="play-btn-caesar"]')

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
    - text: HELLOPLAYBACKUPDATE
  - text: Shift Amount
  - textbox "Shift Amount": "3"
  - text: Mode Select
  - combobox "Mode Select":
    - option "Encrypt" [selected]
    - option "Decrypt"
  - button "Encrypt Mode"
  - button "Decrypt Mode"
  - text: Output Text KHOORSODBEDFNXSGDWH
  - heading "Concentric Wheel Visualizer" [level=4]
  - button "Step Backward": ⏮
  - button "Pause"
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
  112 |     const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
  113 |     if (await encryptBtn.count() > 0) {
  114 |       await encryptBtn.click();
  115 |     }
  116 |     
  117 |     // Under reduced motion, output should update instantly
  118 |     await expect(page.locator('[data-testid="output-text-caesar"]')).toHaveText('KHOOR');
  119 |   });
  120 | 
  121 |   test('TC-T3-INTERACT-08 (Keyboard Accessibility Navigation)', async ({ page }) => {
  122 |     // Focus first timeline node
  123 |     const firstNode = page.locator('[data-testid="timeline-node-caesar"]');
  124 |     await firstNode.focus();
  125 |     await expect(firstNode).toBeFocused();
  126 |     
  127 |     // Tab to next
  128 |     await page.keyboard.press('Tab');
  129 |     const secondNode = page.locator('[data-testid="timeline-node-vigenere"]');
  130 |     await expect(secondNode).toBeFocused();
  131 |     
  132 |     // Tab to Polybius (let's focus directly or tab to it)
  133 |     const polybiusNode = page.locator('[data-testid="timeline-node-polybius"]');
  134 |     await polybiusNode.focus();
  135 |     await page.keyboard.press('Enter');
  136 |     
  137 |     const polybiusExhibit = page.locator('[data-testid="exhibit-polybius"]');
  138 |     await expect(polybiusExhibit).toBeInViewport();
  139 |   });
  140 | 
  141 |   test('TC-T3-INTERACT-09 (Error Auto-dismissal)', async ({ page }) => {
  142 |     await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
  143 |     await page.fill('[data-testid="param-shift-caesar"]', 'abc');
  144 |     
  145 |     const errorMsg = page.locator('[data-testid="error-message-caesar"]');
  146 |     await expect(errorMsg).toBeVisible();
  147 |     
  148 |     // Put valid shift
  149 |     await page.fill('[data-testid="param-shift-caesar"]', '3');
  150 |     await expect(errorMsg).not.toBeVisible();
  151 |   });
  152 | 
  153 |   test('TC-T3-INTERACT-10 (Output Copy-Paste Integration)', async ({ page }) => {
  154 |     // Playwright context clipboard access might require permissions or we test click behavior
  155 |     await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
  156 |     await page.fill('[data-testid="param-shift-caesar"]', '3');
  157 |     
  158 |     const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
  159 |     if (await encryptBtn.count() > 0) { await encryptBtn.click(); }
  160 |     
  161 |     const copyBtn = page.locator('[data-testid="copy-btn-caesar"]');
  162 |     if (await copyBtn.count() > 0) {
  163 |       await copyBtn.click();
  164 |       // Verify clipboard or output text
  165 |       const outputText = await page.locator('[data-testid="output-text-caesar"]').textContent();
  166 |       expect(outputText).toBe('KHOOR');
  167 |     }
  168 |   });
  169 | 
  170 |   test('TC-T3-INTERACT-11 (Keyboard Focus Trapping)', async ({ page }) => {
  171 |     // Open some settings modal/drawer if exists, otherwise mock modal check
  172 |     const modalTrigger = page.locator('[data-testid="open-settings-btn-enigma"]');
  173 |     if (await modalTrigger.count() > 0) {
  174 |       await modalTrigger.click();
  175 |       
  176 |       const modalContainer = page.locator('[data-testid="settings-modal-enigma"]');
  177 |       await expect(modalContainer).toBeVisible();
  178 |       
  179 |       // Focus element in modal
  180 |       await page.keyboard.press('Tab');
  181 |       // Verify focused element is inside modal
  182 |       const focused = page.locator(':focus');
  183 |       await expect(modalContainer).toContainText(await focused.textContent() || '');
  184 |       
  185 |       // ESC closes
  186 |       await page.keyboard.press('Escape');
  187 |       await expect(modalContainer).not.toBeVisible();
  188 |     }
  189 |   });
  190 | 
  191 |   test('TC-T3-INTERACT-12 (Deep Linking & Timeline Navigation)', async ({ page }) => {
  192 |     await page.goto('/#aes');
  193 |     const aesExhibit = page.locator('[data-testid="exhibit-aes"]');
  194 |     await expect(aesExhibit).toBeInViewport();
  195 |     
  196 |     const aesNode = page.locator('[data-testid="timeline-node-aes"]');
  197 |     await expect(aesNode).toHaveClass(/active|highlighted|bg-amber-500|font-bold/);
  198 |   });
  199 | 
  200 |   test('TC-T3-INTERACT-13 (Playback Control State Protection)', async ({ page }) => {
  201 |     await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
  202 |     const playBtn = page.locator('[data-testid="play-btn-caesar"]');
  203 |     if (await playBtn.count() > 0) {
  204 |       await playBtn.click();
  205 |       
  206 |       // Modify text during play
  207 |       await page.fill('[data-testid="input-text-caesar"]', 'HELLOPLAYBACKUPDATE');
  208 |       
  209 |       // Animation should pause or reset
  210 |       const pauseBtn = page.locator('[data-testid="pause-btn-caesar"]');
  211 |       if (await pauseBtn.count() > 0) {
> 212 |         await expect(playBtn).toBeVisible();
      |                               ^ Error: expect(locator).toBeVisible() failed
  213 |       }
  214 |     }
  215 |   });
  216 | 
  217 |   test('TC-T3-INTERACT-14 (Reset Button Clear state)', async ({ page }) => {
  218 |     await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
  219 |     await page.fill('[data-testid="param-shift-caesar"]', '5');
  220 |     
  221 |     const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
  222 |     if (await encryptBtn.count() > 0) { await encryptBtn.click(); }
  223 |     
  224 |     const resetBtn = page.locator('[data-testid="reset-btn-caesar"]');
  225 |     if (await resetBtn.count() > 0) {
  226 |       await resetBtn.click();
  227 |       await expect(page.locator('[data-testid="input-text-caesar"]')).toHaveValue('');
  228 |       await expect(page.locator('[data-testid="output-text-caesar"]')).toHaveText('');
  229 |     }
  230 |   });
  231 | 
  232 |   test('TC-T3-INTERACT-15 (Playback Speed preservation)', async ({ page }) => {
  233 |     const slider = page.locator('[data-testid="speed-slider-caesar"]');
  234 |     if (await slider.count() > 0) {
  235 |       await slider.fill('500'); // 500ms delay
  236 |       
  237 |       const vigenereNode = page.locator('[data-testid="timeline-node-vigenere"]');
  238 |       await vigenereNode.click();
  239 |       
  240 |       const caesarNode = page.locator('[data-testid="timeline-node-caesar"]');
  241 |       await caesarNode.click();
  242 |       
  243 |       await expect(slider).toHaveValue('500');
  244 |     }
  245 |   });
  246 | });
  247 | 
```