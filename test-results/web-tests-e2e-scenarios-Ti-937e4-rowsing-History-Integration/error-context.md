# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web/tests/e2e/scenarios.spec.ts >> Tier 4: Real-World Application Scenarios E2E Tests >> TC-T4-SCENARIO-10: Timeline Browsing History Integration
- Location: web/tests/e2e/scenarios.spec.ts:368:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Tier 4: Real-World Application Scenarios E2E Tests', () => {
  4   |   test.beforeEach(async ({ page }) => {
> 5   |     await page.goto('/');
      |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  6   |   });
  7   | 
  8   |   test('TC-T4-SCENARIO-01: Multi-Stage Classical Transmission', async ({ page }) => {
  9   |     // 1. Input plaintext "MUSEUM VISIT AT NOON" into Caesar.
  10  |     await page.fill('[data-testid="input-text-caesar"]', 'MUSEUM VISIT AT NOON');
  11  |     // 2. Set shift = 7, mode = Encrypt.
  12  |     await page.fill('[data-testid="param-shift-caesar"]', '7');
  13  |     const encryptBtnCaesar = page.locator('[data-testid="encrypt-btn-caesar"]');
  14  |     if (await encryptBtnCaesar.count() > 0) { await encryptBtnCaesar.click(); }
  15  |     const outputCaesar = page.locator('[data-testid="output-text-caesar"]');
  16  |     await expect(outputCaesar).not.toBeEmpty();
  17  |     const caesarOutput = await outputCaesar.textContent();
  18  |     expect(caesarOutput).not.toBe('');
  19  | 
  20  |     // 3. Copy Caesar output, paste it into Vigenère.
  21  |     await page.fill('[data-testid="input-text-vigenere"]', caesarOutput || '');
  22  |     // 4. Set key = "SECRET", mode = Encrypt.
  23  |     await page.fill('[data-testid="param-key-vigenere"]', 'SECRET');
  24  |     const encryptBtnVigenere = page.locator('[data-testid="encrypt-btn-vigenere"]');
  25  |     if (await encryptBtnVigenere.count() > 0) { await encryptBtnVigenere.click(); }
  26  |     const outputVigenere = page.locator('[data-testid="output-text-vigenere"]');
  27  |     await expect(outputVigenere).not.toBeEmpty();
  28  |     const vigenereOutput = await outputVigenere.textContent();
  29  |     expect(vigenereOutput).not.toBe('');
  30  | 
  31  |     // 5. Copy Vigenère output, paste it into Scytale.
  32  |     await page.fill('[data-testid="input-text-scytale"]', vigenereOutput || '');
  33  |     // 6. Set width = 3, mode = Encrypt.
  34  |     await page.fill('[data-testid="param-width-scytale"]', '3');
  35  |     const encryptBtnScytale = page.locator('[data-testid="encrypt-btn-scytale"]');
  36  |     if (await encryptBtnScytale.count() > 0) { await encryptBtnScytale.click(); }
  37  |     const outputScytale = page.locator('[data-testid="output-text-scytale"]');
  38  |     await expect(outputScytale).not.toBeEmpty();
  39  |     const scytaleOutput = await outputScytale.textContent();
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
```