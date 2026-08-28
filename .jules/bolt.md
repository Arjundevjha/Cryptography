## 2025-05-18 - Vectorize Vigenère Cipher Operations
**Learning:** In string-processing ciphers, per-character helper function dispatch (`_encrypt_decrypt_char`) combined with string concatenation (`+=`) and key re-padding (`_pad_key`) creates significant overhead ($O(N)$ string copying and function call stack allocation). Pre-computing key shift integer arrays and accumulating characters in a Python list before calling `''.join()` delivers ~2.3x performance speedups.
**Action:** Vectorize key shifts into integer arrays and use single-pass list accumulation for character-by-character string transformations.

## 2025-05-19 - Vectorize Affine Cipher via str.maketrans
**Learning:** In fixed-alphabet ciphers like Affine cipher, replacing per-character Python loop checks (`char.isalpha()`, `ord()`, modulo arithmetic, `chr()`) with pre-computed lookup tables via `str.maketrans` and `str.translate` offloads string transformations directly to C-level execution, achieving ~60-80x speedups.
**Action:** Pre-compute 26-character translation mapping tables using `str.maketrans` and process strings using `str.translate` for substitution/affine ciphers.

## 2025-05-20 - Vectorize Scytale Cipher Transposition via Strided Slicing
**Learning:** Explicit Python nested loops with index arithmetic (`row * diameter + col`) and per-character appending incur heavy bytecode loop interpretation overhead. Python's strided string slicing (`str[start::step]`) offloads index calculation and sequence extraction to optimized C memory routines, achieving ~150x speedups.
**Action:** Use strided string slicing `[col::stride]` for column-wise or matrix transposition algorithms on strings.
