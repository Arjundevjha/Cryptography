## 2025-05-18 - Vectorize Vigenère Cipher Operations
**Learning:** In string-processing ciphers, per-character helper function dispatch (`_encrypt_decrypt_char`) combined with string concatenation (`+=`) and key re-padding (`_pad_key`) creates significant overhead ($O(N)$ string copying and function call stack allocation). Pre-computing key shift integer arrays and accumulating characters in a Python list before calling `''.join()` delivers ~2.3x performance speedups.
**Action:** Vectorize key shifts into integer arrays and use single-pass list accumulation for character-by-character string transformations.

## 2025-05-19 - Vectorize Affine Cipher via str.maketrans
**Learning:** In fixed-alphabet ciphers like Affine cipher, replacing per-character Python loop checks (`char.isalpha()`, `ord()`, modulo arithmetic, `chr()`) with pre-computed lookup tables via `str.maketrans` and `str.translate` offloads string transformations directly to C-level execution, achieving ~60-80x speedups.
**Action:** Pre-compute 26-character translation mapping tables using `str.maketrans` and process strings using `str.translate` for substitution/affine ciphers.

## 2025-05-20 - Vectorize Scytale Cipher Transposition via Strided Slicing
**Learning:** Explicit Python nested loops with index arithmetic (`row * diameter + col`) and per-character appending incur heavy bytecode loop interpretation overhead. Python's strided string slicing (`str[start::step]`) offloads index calculation and sequence extraction to optimized C memory routines, achieving ~150x speedups.
**Action:** Use strided string slicing `[col::stride]` for column-wise or matrix transposition algorithms on strings.

## 2025-05-20 - Pre-compute Coordinate Maps for Grid Ciphers
**Learning:** Grid-based ciphers like Polybius Square suffer from repeated $O(K)$ string searching (`key.index(...)`), modulo/division arithmetic, and dynamic string formatting within per-character loops. Pre-computing dictionary maps (`pos_map` for character-to-coordinate string and `coord_map` for coordinate-pair to character) reduces per-character lookups to $O(1)$ dictionary lookups, providing a ~2.8x speedup for encryption and ~1.5x for decryption.
**Action:** Always pre-compute coordinate lookup maps when performing grid or table-based character lookups in ciphers.

## 2025-05-21 - Optimize Enigma Rotor State Transitions with Modular Offset Arithmetic
**Learning:** In stateful wheel ciphers like Enigma rotors, performing string re-slicing (`self.left[1:] + self.left[0]`) on every rotor step and `str.find()` calls during forward/backwards signal routing creates heavy string allocation and linear search overhead. Maintaining fixed array lookup maps and tracking rotor position via modular integer offset arithmetic (`(signal + offset) % 26`) eliminates memory allocations and provides a ~2.3x speedup.
**Action:** Use fixed lookup arrays and modular position offsets for stateful rotating wheel ciphers.
