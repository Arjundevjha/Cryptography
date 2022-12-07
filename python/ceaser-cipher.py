import string

plain_text = input("Please enter in your plain text: ")
shift = 3
shift %= 26

alphabet = string.ascii_lowercase
shifted = alphabet[shift:] + alphabet[:shift]
table = str.maketrans(alphabet, shifted)

encrypted = plain_text.translate(table)

print(encrypted)