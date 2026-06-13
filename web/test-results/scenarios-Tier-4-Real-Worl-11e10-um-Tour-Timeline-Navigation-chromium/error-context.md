# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scenarios.spec.ts >> Tier 4: Real-World Application Scenarios E2E Tests >> TC-T4-SCENARIO-03: Museum Tour Timeline Navigation
- Location: tests/e2e/scenarios.spec.ts:137:7

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator: locator('[data-testid="timeline-node-caesar"]')
Expected pattern: /active|highlighted/
Received string:  "px-4 py-2 rounded-full text-xs font-mono border transition bg-slate-850 border-slate-700 text-slate-400 hover:text-slate-200"
Timeout: 5000ms

Call log:
  - Expect "toHaveClass" with timeout 5000ms
  - waiting for locator('[data-testid="timeline-node-caesar"]')
    4 × locator resolved to <button aria-current="location" data-testid="timeline-node-caesar" class="px-4 py-2 rounded-full text-xs font-mono border transition bg-amber-500 border-amber-500 text-slate-950 font-bold">Caesar Cipher (50 BC)</button>
      - unexpected value "px-4 py-2 rounded-full text-xs font-mono border transition bg-amber-500 border-amber-500 text-slate-950 font-bold"
    10 × locator resolved to <button data-testid="timeline-node-caesar" class="px-4 py-2 rounded-full text-xs font-mono border transition bg-slate-850 border-slate-700 text-slate-400 hover:text-slate-200">Caesar Cipher (50 BC)</button>
       - unexpected value "px-4 py-2 rounded-full text-xs font-mono border transition bg-slate-850 border-slate-700 text-slate-400 hover:text-slate-200"

```

```yaml
- button "Caesar Cipher (50 BC)"
```

# Test source

```ts
  40  |     expect(scytaleOutput).not.toBe('');
  41  | 
  42  |     // 7. Perform reverse path: Scytale Decrypt
  43  |     await page.fill('[data-testid="input-text-scytale"]', scytaleOutput || '');
  44  |     const decryptBtnScytale = page.locator('[data-testid="decrypt-btn-scytale"]');
  45  |     if (await decryptBtnScytale.count() > 0) {
  46  |       await decryptBtnScytale.click();
  47  |     } else {
  48  |       await page.selectOption('[data-testid="mode-select-scytale"]', 'decrypt');
  49  |     }
  50  |     const scytaleDecrypted = await page.locator('[data-testid="output-text-scytale"]').textContent();
  51  | 
  52  |     // Vigenere Decrypt
  53  |     await page.fill('[data-testid="input-text-vigenere"]', scytaleDecrypted || '');
  54  |     await page.fill('[data-testid="param-key-vigenere"]', 'SECRET');
  55  |     const decryptBtnVigenere = page.locator('[data-testid="decrypt-btn-vigenere"]');
  56  |     if (await decryptBtnVigenere.count() > 0) {
  57  |       await decryptBtnVigenere.click();
  58  |     } else {
  59  |       await page.selectOption('[data-testid="mode-select-vigenere"]', 'decrypt');
  60  |     }
  61  |     const vigenereDecrypted = await page.locator('[data-testid="output-text-vigenere"]').textContent();
  62  | 
  63  |     // Caesar Decrypt
  64  |     await page.fill('[data-testid="input-text-caesar"]', vigenereDecrypted || '');
  65  |     await page.fill('[data-testid="param-shift-caesar"]', '7');
  66  |     const decryptBtnCaesar = page.locator('[data-testid="decrypt-btn-caesar"]');
  67  |     if (await decryptBtnCaesar.count() > 0) {
  68  |       await decryptBtnCaesar.click();
  69  |     } else {
  70  |       await page.selectOption('[data-testid="mode-select-caesar"]', 'decrypt');
  71  |     }
  72  |     const caesarDecrypted = await page.locator('[data-testid="output-text-caesar"]').textContent();
  73  | 
  74  |     // 8. Verify final output matches original "MUSEUM VISIT AT NOON"
  75  |     expect(caesarDecrypted?.toUpperCase().trim()).toBe('MUSEUM VISIT AT NOON');
  76  |   });
  77  | 
  78  |   test('TC-T4-SCENARIO-02: Modern Secure Channel Simulation', async ({ page }) => {
  79  |     // 1. RSA exhibit. Generate keypair with p=61, q=53.
  80  |     const rsaNode = page.locator('[data-testid="timeline-node-rsa"]');
  81  |     await rsaNode.click();
  82  |     await page.fill('[data-testid="param-p-rsa"]', '61');
  83  |     await page.fill('[data-testid="param-q-rsa"]', '53');
  84  |     const genBtn = page.locator('[data-testid="generate-keys-btn-rsa"]');
  85  |     if (await genBtn.count() > 0) { await genBtn.click(); }
  86  | 
  87  |     // 2. Generate a random AES symmetric key (16 bytes)
  88  |     const aesKey = '1234567890123456';
  89  | 
  90  |     // 3. AES exhibit. Input message "Top Secret Exhibit Document" and encrypt.
  91  |     const aesNode = page.locator('[data-testid="timeline-node-aes"]');
  92  |     await aesNode.click();
  93  |     await page.fill('[data-testid="input-text-aes"]', 'Top Secret Exhibit Document');
  94  |     await page.fill('[data-testid="param-key-aes"]', aesKey);
  95  |     const encryptBtnAes = page.locator('[data-testid="encrypt-btn-aes"]');
  96  |     if (await encryptBtnAes.count() > 0) { await encryptBtnAes.click(); }
  97  |     const outputAes = page.locator('[data-testid="output-text-aes"]');
  98  |     await expect(outputAes).not.toBeEmpty();
  99  |     const aesCiphertext = await outputAes.textContent();
  100 |     expect(aesCiphertext).not.toBe('');
  101 | 
  102 |     // 4. RSA Encrypt AES Key
  103 |     await rsaNode.click();
  104 |     await page.fill('[data-testid="input-text-rsa"]', aesKey);
  105 |     const encryptBtnRsa = page.locator('[data-testid="encrypt-btn-rsa"]');
  106 |     if (await encryptBtnRsa.count() > 0) { await encryptBtnRsa.click(); }
  107 |     const outputRsa = page.locator('[data-testid="output-text-rsa"]');
  108 |     await expect(outputRsa).not.toBeEmpty();
  109 |     const encryptedKey = await outputRsa.textContent();
  110 |     expect(encryptedKey).not.toBe('');
  111 | 
  112 |     // 6. RSA Decrypt Key
  113 |     await page.fill('[data-testid="input-text-rsa"]', encryptedKey || '');
  114 |     const decryptBtnRsa = page.locator('[data-testid="decrypt-btn-rsa"]');
  115 |     if (await decryptBtnRsa.count() > 0) {
  116 |       await decryptBtnRsa.click();
  117 |     } else {
  118 |       await page.selectOption('[data-testid="mode-select-rsa"]', 'decrypt');
  119 |     }
  120 |     const decryptedKey = await page.locator('[data-testid="output-text-rsa"]').textContent();
  121 |     expect(decryptedKey).toBe(aesKey);
  122 | 
  123 |     // 7. AES Decrypt ciphertext
  124 |     await aesNode.click();
  125 |     await page.fill('[data-testid="input-text-aes"]', aesCiphertext || '');
  126 |     await page.fill('[data-testid="param-key-aes"]', decryptedKey || '');
  127 |     const decryptBtnAes = page.locator('[data-testid="decrypt-btn-aes"]');
  128 |     if (await decryptBtnAes.count() > 0) {
  129 |       await decryptBtnAes.click();
  130 |     } else {
  131 |       await page.selectOption('[data-testid="mode-select-aes"]', 'decrypt');
  132 |     }
  133 |     // 8. Verify
  134 |     await expect(page.locator('[data-testid="output-text-aes"]')).toHaveText('Top Secret Exhibit Document');
  135 |   });
  136 | 
  137 |   test('TC-T4-SCENARIO-03: Museum Tour Timeline Navigation', async ({ page }) => {
  138 |     // 1. Load application. Verify Caesar timeline highlighted
  139 |     const caesarNode = page.locator('[data-testid="timeline-node-caesar"]');
> 140 |     await expect(caesarNode).toHaveClass(/active|highlighted/);
      |                              ^ Error: expect(locator).toHaveClass(expected) failed
  141 | 
  142 |     // 2. Click Enigma node. Verify Enigma visible
  143 |     const enigmaNode = page.locator('[data-testid="timeline-node-enigma"]');
  144 |     await enigmaNode.click();
  145 |     const enigmaExhibit = page.locator('[data-testid="exhibit-enigma"]');
  146 |     await expect(enigmaExhibit).toBeInViewport();
  147 | 
  148 |     // 3. Manually scroll to Enigma, check timeline node highlight
  149 |     await enigmaExhibit.scrollIntoViewIfNeeded();
  150 |     await expect(enigmaNode).toHaveClass(/active|highlighted|bg-amber-500|font-bold/);
  151 | 
  152 |     // 4. Keyboard navigation to AES
  153 |     const aesNode = page.locator('[data-testid="timeline-node-aes"]');
  154 |     await aesNode.focus();
  155 |     await page.keyboard.press('Enter');
  156 |     const aesExhibit = page.locator('[data-testid="exhibit-aes"]');
  157 |     await expect(aesExhibit).toBeInViewport();
  158 |   });
  159 | 
  160 |   test('TC-T4-SCENARIO-04: Database Integrity Simulation', async ({ page }) => {
  161 |     // 1. Input text into SHA-256
  162 |     const shaNode = page.locator('[data-testid="timeline-node-sha256"]');
  163 |     await shaNode.click();
  164 |     const entryText = 'ID: 1001, Name: Gold Mask, Value: Priceless';
  165 |     await page.fill('[data-testid="input-text-sha256"]', entryText);
  166 |     const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
  167 |     if (await hashBtn.count() > 0) { await hashBtn.click(); }
  168 |     const outputSha = page.locator('[data-testid="output-text-sha256"]');
  169 |     await expect(outputSha).not.toBeEmpty();
  170 |     const origHash = await outputSha.textContent();
  171 | 
  172 |     // 3. AES Encrypt
  173 |     const aesNode = page.locator('[data-testid="timeline-node-aes"]');
  174 |     await aesNode.click();
  175 |     await page.fill('[data-testid="input-text-aes"]', entryText);
  176 |     await page.fill('[data-testid="param-key-aes"]', 'DB_KEY_SECURE_99');
  177 |     const encryptBtnAes = page.locator('[data-testid="encrypt-btn-aes"]');
  178 |     if (await encryptBtnAes.count() > 0) { await encryptBtnAes.click(); }
  179 |     const outputAes = page.locator('[data-testid="output-text-aes"]');
  180 |     await expect(outputAes).not.toBeEmpty();
  181 |     const aesCiphertext = await outputAes.textContent();
  182 | 
  183 |     // 4. Modify single letter
  184 |     const modifiedText = 'ID: 1001, Name: Gold Mask, Value: PricelesS'; // change final s to S
  185 |     await shaNode.click();
  186 |     await page.fill('[data-testid="input-text-sha256"]', modifiedText);
  187 |     if (await hashBtn.count() > 0) { await hashBtn.click(); }
  188 |     await expect(outputSha).not.toBeEmpty();
  189 |     const newHash = await outputSha.textContent();
  190 | 
  191 |     // 5. Verify hash is different
  192 |     expect(newHash).not.toEqual(origHash);
  193 | 
  194 |     // 6. Encrypt modified text
  195 |     await aesNode.click();
  196 |     await page.fill('[data-testid="input-text-aes"]', modifiedText);
  197 |     if (await encryptBtnAes.count() > 0) { await encryptBtnAes.click(); }
  198 |     await expect(outputAes).not.toBeEmpty();
  199 |     const newAesCiphertext = await outputAes.textContent();
  200 |     expect(newAesCiphertext).not.toEqual(aesCiphertext);
  201 | 
  202 |     // 7. Decrypt original ciphertext
  203 |     await page.fill('[data-testid="input-text-aes"]', aesCiphertext || '');
  204 |     const decryptBtnAes = page.locator('[data-testid="decrypt-btn-aes"]');
  205 |     if (await decryptBtnAes.count() > 0) {
  206 |       await decryptBtnAes.click();
  207 |     } else {
  208 |       await page.selectOption('[data-testid="mode-select-aes"]', 'decrypt');
  209 |     }
  210 |     await expect(page.locator('[data-testid="output-text-aes"]')).toHaveText(entryText);
  211 |   });
  212 | 
  213 |   test('TC-T4-SCENARIO-05: Enigma Operational Simulation', async ({ page }) => {
  214 |     const enigmaNode = page.locator('[data-testid="timeline-node-enigma"]');
  215 |     await enigmaNode.click();
  216 | 
  217 |     // 1. Configure Enigma
  218 |     const rotorSelect = page.locator('[data-testid="param-rotors-enigma"]');
  219 |     if (await rotorSelect.count() > 0) { await rotorSelect.fill('I-II-III'); }
  220 |     const posSelect = page.locator('[data-testid="param-positions-enigma"]');
  221 |     if (await posSelect.count() > 0) { await posSelect.fill('M-C-K'); }
  222 |     const ringsSelect = page.locator('[data-testid="param-rings-enigma"]');
  223 |     if (await ringsSelect.count() > 0) { await ringsSelect.fill('O-P-Q'); }
  224 |     const plugboardSelect = page.locator('[data-testid="param-plugboard-enigma"]');
  225 |     if (await plugboardSelect.count() > 0) { await plugboardSelect.fill('AD FT LY UX'); }
  226 | 
  227 |     // 3. Input text
  228 |     await page.fill('[data-testid="input-text-enigma"]', 'CONGRATULATIONS');
  229 | 
  230 |     // 4. Play button and Speed Slider
  231 |     const speed = page.locator('[data-testid="speed-slider-enigma"]');
  232 |     if (await speed.count() > 0) { await speed.fill('100'); } // Max speed
  233 |     const playBtn = page.locator('[data-testid="play-btn-enigma"]');
  234 |     if (await playBtn.count() > 0) {
  235 |       await playBtn.click();
  236 |       // Wait for output or click encrypt directly if play isn't required for final value
  237 |     } else {
  238 |       const encryptBtn = page.locator('[data-testid="encrypt-btn-enigma"]');
  239 |       if (await encryptBtn.count() > 0) { await encryptBtn.click(); }
  240 |     }
```