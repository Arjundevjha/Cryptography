def hash(string):
  # the prime number used in the hash function
  PRIME = 31

  # initialize the hash value to the length of the string
  hash_value = len(string)

  # add the ASCII value of each character in the string to the hash value
  for char in string:
    hash_value += ord(char)

  # multiply the hash value by the prime number and return it
  return hash_value * PRIME

hashed_string = hash("hello")
# hashed_string will be 271