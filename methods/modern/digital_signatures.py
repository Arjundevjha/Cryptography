import hashlib
import hmac

# The HMAC key
key = b'mysecretkey'

# The data to be signed
data = b'Hello World'

# Create a new HMAC instance
h = hmac.new(key, data, hashlib.sha256)

# Calculate the HMAC digest
digest = h.hexdigest()

print(digest) # Outputs the HMAC digest in hexadecimal format
