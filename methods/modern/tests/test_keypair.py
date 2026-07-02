import unittest
from methods.modern.keypair import is_prime, MIN_PRIME

class TestKeyPairIsPrime(unittest.TestCase):
    def test_is_prime_negative_values(self):
        """Test is_prime with negative values to cover the edge case."""
        self.assertFalse(is_prime(-1))
        self.assertFalse(is_prime(-2))
        self.assertFalse(is_prime(-100))

    def test_is_prime_zero_and_one(self):
        """Test is_prime with 0 and 1 which are not prime."""
        self.assertFalse(is_prime(0))
        self.assertFalse(is_prime(1))

    def test_is_prime_small_primes(self):
        """Test small known prime numbers."""
        self.assertTrue(is_prime(2))
        self.assertTrue(is_prime(3))
        self.assertTrue(is_prime(5))
        self.assertTrue(is_prime(7))
        self.assertTrue(is_prime(11))
        self.assertTrue(is_prime(13))

    def test_is_prime_small_non_primes(self):
        """Test small known non-prime numbers."""
        self.assertFalse(is_prime(4))
        self.assertFalse(is_prime(6))
        self.assertFalse(is_prime(8))
        self.assertFalse(is_prime(9))
        self.assertFalse(is_prime(10))
        self.assertFalse(is_prime(15))

    def test_is_prime_large_prime(self):
        """Test a reasonably large prime."""
        # 7919 is the 1000th prime number
        self.assertTrue(is_prime(7919))

    def test_is_prime_large_non_prime(self):
        """Test a reasonably large non-prime."""
        # 7920 is clearly not prime (even)
        self.assertFalse(is_prime(7920))
        # 7921 is 89^2
        self.assertFalse(is_prime(7921))

if __name__ == '__main__':
    unittest.main()
