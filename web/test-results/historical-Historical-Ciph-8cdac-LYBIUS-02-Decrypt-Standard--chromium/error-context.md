# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: historical.spec.ts >> Historical Ciphers E2E Tests >> TC-T1-POLYBIUS-02 (Decrypt Standard)
- Location: tests/e2e/historical.spec.ts:155:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - heading "🔒 Cryptography Museum" [level=1] [ref=e4]
      - navigation [ref=e5]:
        - link "Classical" [ref=e6] [cursor=pointer]:
          - /url: "#"
        - link "Historical" [ref=e7] [cursor=pointer]:
          - /url: "#"
        - link "Modern" [ref=e8] [cursor=pointer]:
          - /url: "#"
  - main [ref=e9]:
    - generic [ref=e10]:
      - navigation "Chronological Timeline" [ref=e12]:
        - button "Caesar Cipher (50 BC)" [ref=e13] [cursor=pointer]
        - button "Vigenère (1553)" [ref=e14] [cursor=pointer]
        - button "Affine Cipher (Math)" [ref=e15] [cursor=pointer]
        - button "Scytale" [ref=e16] [cursor=pointer]
        - button "Polybius Square" [ref=e17] [cursor=pointer]
        - button "Enigma Machine" [ref=e18] [cursor=pointer]
        - button "AES Standard" [ref=e19] [cursor=pointer]
        - button "RSA Standard" [ref=e20] [cursor=pointer]
        - button "SHA-256 Hash" [ref=e21] [cursor=pointer]
      - generic [ref=e22]:
        - generic [ref=e23]:
          - heading "🔒 Cryptography Museum" [level=2] [ref=e24]
          - paragraph [ref=e25]: Interact with classical substitution ciphers, historical enigma machine emulators, and modern cryptographic standards.
        - generic [ref=e26]:
          - heading "Caesar Cipher" [level=3] [ref=e27]
          - paragraph [ref=e28]: A basic shift cipher where each letter is replaced by a letter some fixed number of positions down the alphabet.
          - generic [ref=e29]:
            - generic [ref=e30]:
              - generic [ref=e31]:
                - generic [ref=e32]: Input Text (Max 500 Chars)
                - textbox "Input Text (Max 500 Chars)" [ref=e33]:
                  - /placeholder: Enter secret message...
              - generic [ref=e34]:
                - generic [ref=e35]:
                  - generic [ref=e36]: Shift Amount
                  - textbox "Shift Amount" [ref=e37]: "3"
                - generic [ref=e38]:
                  - generic [ref=e39]: Mode Select
                  - combobox "Mode Select" [ref=e40]:
                    - option "Encrypt" [selected]
                    - option "Decrypt"
              - generic [ref=e41]:
                - button "Encrypt Mode" [ref=e42] [cursor=pointer]
                - button "Decrypt Mode" [ref=e43] [cursor=pointer]
              - generic [ref=e45]: Output Text
            - generic [ref=e47]:
              - heading "Concentric Wheel Visualizer" [level=4] [ref=e48]
              - img [ref=e50]:
                - generic [ref=e53]: A
                - generic [ref=e54]: B
                - generic [ref=e55]: C
                - generic [ref=e56]: D
                - generic [ref=e57]: E
                - generic [ref=e58]: F
                - generic [ref=e59]: G
                - generic [ref=e60]: H
                - generic [ref=e61]: I
                - generic [ref=e62]: J
                - generic [ref=e63]: K
                - generic [ref=e64]: L
                - generic [ref=e65]: M
                - generic [ref=e66]: "N"
                - generic [ref=e67]: O
                - generic [ref=e68]: P
                - generic [ref=e69]: Q
                - generic [ref=e70]: R
                - generic [ref=e71]: S
                - generic [ref=e72]: T
                - generic [ref=e73]: U
                - generic [ref=e74]: V
                - generic [ref=e75]: W
                - generic [ref=e76]: X
                - generic [ref=e77]: "Y"
                - generic [ref=e78]: Z
                - generic [ref=e79]: D
                - generic [ref=e80]: E
                - generic [ref=e81]: F
                - generic [ref=e82]: G
                - generic [ref=e83]: H
                - generic [ref=e84]: I
                - generic [ref=e85]: J
                - generic [ref=e86]: K
                - generic [ref=e87]: L
                - generic [ref=e88]: M
                - generic [ref=e89]: "N"
                - generic [ref=e90]: O
                - generic [ref=e91]: P
                - generic [ref=e92]: Q
                - generic [ref=e93]: R
                - generic [ref=e94]: S
                - generic [ref=e95]: T
                - generic [ref=e96]: U
                - generic [ref=e97]: V
                - generic [ref=e98]: W
                - generic [ref=e99]: X
                - generic [ref=e100]: "Y"
                - generic [ref=e101]: Z
                - generic [ref=e102]: A
                - generic [ref=e103]: B
                - generic [ref=e104]: C
              - generic [ref=e105]:
                - generic [ref=e106]:
                  - button "Step Backward" [ref=e107] [cursor=pointer]: ⏮
                  - button "Play" [ref=e108] [cursor=pointer]
                  - button "Step Forward" [ref=e109] [cursor=pointer]: ⏭
                  - button "Reset" [ref=e110] [cursor=pointer]: 🔄
                - generic [ref=e111]:
                  - generic [ref=e112]: "Speed:"
                  - slider "Speed:" [ref=e113]: "1000"
                  - generic [ref=e114]: 1000ms
        - generic [ref=e115]:
          - heading "Vigenère Cipher" [level=3] [ref=e116]
          - paragraph [ref=e117]: A polyalphabetic substitution cipher that shifts text letters using a keyword cycled repeatedly.
          - generic [ref=e118]:
            - generic [ref=e119]:
              - generic [ref=e120]:
                - generic [ref=e121]: Input Text (Max 500 Chars)
                - textbox "Input Text (Max 500 Chars)" [ref=e122]:
                  - /placeholder: Enter secret message...
              - generic [ref=e123]:
                - generic [ref=e124]:
                  - generic [ref=e125]: Keyword
                  - textbox "Keyword" [ref=e126]: LEMON
                - generic [ref=e127]:
                  - generic [ref=e128]: Mode Select
                  - combobox "Mode Select" [ref=e129]:
                    - option "Encrypt" [selected]
                    - option "Decrypt"
              - generic [ref=e130]:
                - button "Encrypt Mode" [ref=e131] [cursor=pointer]
                - button "Decrypt Mode" [ref=e132] [cursor=pointer]
              - generic [ref=e134]: Output Text
            - generic [ref=e136]:
              - heading "Vigenère Square (Tabula Recta)" [level=4] [ref=e137]
              - table [ref=e139]:
                - rowgroup [ref=e140]:
                  - row "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z" [ref=e141]:
                    - columnheader [ref=e142]
                    - columnheader "A" [ref=e143]
                    - columnheader "B" [ref=e144]
                    - columnheader "C" [ref=e145]
                    - columnheader "D" [ref=e146]
                    - columnheader "E" [ref=e147]
                    - columnheader "F" [ref=e148]
                    - columnheader "G" [ref=e149]
                    - columnheader "H" [ref=e150]
                    - columnheader "I" [ref=e151]
                    - columnheader "J" [ref=e152]
                    - columnheader "K" [ref=e153]
                    - columnheader "L" [ref=e154]
                    - columnheader "M" [ref=e155]
                    - columnheader "N" [ref=e156]
                    - columnheader "O" [ref=e157]
                    - columnheader "P" [ref=e158]
                    - columnheader "Q" [ref=e159]
                    - columnheader "R" [ref=e160]
                    - columnheader "S" [ref=e161]
                    - columnheader "T" [ref=e162]
                    - columnheader "U" [ref=e163]
                    - columnheader "V" [ref=e164]
                    - columnheader "W" [ref=e165]
                    - columnheader "X" [ref=e166]
                    - columnheader "Y" [ref=e167]
                    - columnheader "Z" [ref=e168]
                - rowgroup [ref=e169]:
                  - row "A A B C D E F G H I J K L M N O P Q R S T U V W X Y Z" [ref=e170]:
                    - cell "A" [ref=e171]
                    - cell "A" [ref=e172]
                    - cell "B" [ref=e173]
                    - cell "C" [ref=e174]
                    - cell "D" [ref=e175]
                    - cell "E" [ref=e176]
                    - cell "F" [ref=e177]
                    - cell "G" [ref=e178]
                    - cell "H" [ref=e179]
                    - cell "I" [ref=e180]
                    - cell "J" [ref=e181]
                    - cell "K" [ref=e182]
                    - cell "L" [ref=e183]
                    - cell "M" [ref=e184]
                    - cell "N" [ref=e185]
                    - cell "O" [ref=e186]
                    - cell "P" [ref=e187]
                    - cell "Q" [ref=e188]
                    - cell "R" [ref=e189]
                    - cell "S" [ref=e190]
                    - cell "T" [ref=e191]
                    - cell "U" [ref=e192]
                    - cell "V" [ref=e193]
                    - cell "W" [ref=e194]
                    - cell "X" [ref=e195]
                    - cell "Y" [ref=e196]
                    - cell "Z" [ref=e197]
                  - row "B B C D E F G H I J K L M N O P Q R S T U V W X Y Z A" [ref=e198]:
                    - cell "B" [ref=e199]
                    - cell "B" [ref=e200]
                    - cell "C" [ref=e201]
                    - cell "D" [ref=e202]
                    - cell "E" [ref=e203]
                    - cell "F" [ref=e204]
                    - cell "G" [ref=e205]
                    - cell "H" [ref=e206]
                    - cell "I" [ref=e207]
                    - cell "J" [ref=e208]
                    - cell "K" [ref=e209]
                    - cell "L" [ref=e210]
                    - cell "M" [ref=e211]
                    - cell "N" [ref=e212]
                    - cell "O" [ref=e213]
                    - cell "P" [ref=e214]
                    - cell "Q" [ref=e215]
                    - cell "R" [ref=e216]
                    - cell "S" [ref=e217]
                    - cell "T" [ref=e218]
                    - cell "U" [ref=e219]
                    - cell "V" [ref=e220]
                    - cell "W" [ref=e221]
                    - cell "X" [ref=e222]
                    - cell "Y" [ref=e223]
                    - cell "Z" [ref=e224]
                    - cell "A" [ref=e225]
                  - row "C C D E F G H I J K L M N O P Q R S T U V W X Y Z A B" [ref=e226]:
                    - cell "C" [ref=e227]
                    - cell "C" [ref=e228]
                    - cell "D" [ref=e229]
                    - cell "E" [ref=e230]
                    - cell "F" [ref=e231]
                    - cell "G" [ref=e232]
                    - cell "H" [ref=e233]
                    - cell "I" [ref=e234]
                    - cell "J" [ref=e235]
                    - cell "K" [ref=e236]
                    - cell "L" [ref=e237]
                    - cell "M" [ref=e238]
                    - cell "N" [ref=e239]
                    - cell "O" [ref=e240]
                    - cell "P" [ref=e241]
                    - cell "Q" [ref=e242]
                    - cell "R" [ref=e243]
                    - cell "S" [ref=e244]
                    - cell "T" [ref=e245]
                    - cell "U" [ref=e246]
                    - cell "V" [ref=e247]
                    - cell "W" [ref=e248]
                    - cell "X" [ref=e249]
                    - cell "Y" [ref=e250]
                    - cell "Z" [ref=e251]
                    - cell "A" [ref=e252]
                    - cell "B" [ref=e253]
                  - row "D D E F G H I J K L M N O P Q R S T U V W X Y Z A B C" [ref=e254]:
                    - cell "D" [ref=e255]
                    - cell "D" [ref=e256]
                    - cell "E" [ref=e257]
                    - cell "F" [ref=e258]
                    - cell "G" [ref=e259]
                    - cell "H" [ref=e260]
                    - cell "I" [ref=e261]
                    - cell "J" [ref=e262]
                    - cell "K" [ref=e263]
                    - cell "L" [ref=e264]
                    - cell "M" [ref=e265]
                    - cell "N" [ref=e266]
                    - cell "O" [ref=e267]
                    - cell "P" [ref=e268]
                    - cell "Q" [ref=e269]
                    - cell "R" [ref=e270]
                    - cell "S" [ref=e271]
                    - cell "T" [ref=e272]
                    - cell "U" [ref=e273]
                    - cell "V" [ref=e274]
                    - cell "W" [ref=e275]
                    - cell "X" [ref=e276]
                    - cell "Y" [ref=e277]
                    - cell "Z" [ref=e278]
                    - cell "A" [ref=e279]
                    - cell "B" [ref=e280]
                    - cell "C" [ref=e281]
                  - row "E E F G H I J K L M N O P Q R S T U V W X Y Z A B C D" [ref=e282]:
                    - cell "E" [ref=e283]
                    - cell "E" [ref=e284]
                    - cell "F" [ref=e285]
                    - cell "G" [ref=e286]
                    - cell "H" [ref=e287]
                    - cell "I" [ref=e288]
                    - cell "J" [ref=e289]
                    - cell "K" [ref=e290]
                    - cell "L" [ref=e291]
                    - cell "M" [ref=e292]
                    - cell "N" [ref=e293]
                    - cell "O" [ref=e294]
                    - cell "P" [ref=e295]
                    - cell "Q" [ref=e296]
                    - cell "R" [ref=e297]
                    - cell "S" [ref=e298]
                    - cell "T" [ref=e299]
                    - cell "U" [ref=e300]
                    - cell "V" [ref=e301]
                    - cell "W" [ref=e302]
                    - cell "X" [ref=e303]
                    - cell "Y" [ref=e304]
                    - cell "Z" [ref=e305]
                    - cell "A" [ref=e306]
                    - cell "B" [ref=e307]
                    - cell "C" [ref=e308]
                    - cell "D" [ref=e309]
                  - row "F F G H I J K L M N O P Q R S T U V W X Y Z A B C D E" [ref=e310]:
                    - cell "F" [ref=e311]
                    - cell "F" [ref=e312]
                    - cell "G" [ref=e313]
                    - cell "H" [ref=e314]
                    - cell "I" [ref=e315]
                    - cell "J" [ref=e316]
                    - cell "K" [ref=e317]
                    - cell "L" [ref=e318]
                    - cell "M" [ref=e319]
                    - cell "N" [ref=e320]
                    - cell "O" [ref=e321]
                    - cell "P" [ref=e322]
                    - cell "Q" [ref=e323]
                    - cell "R" [ref=e324]
                    - cell "S" [ref=e325]
                    - cell "T" [ref=e326]
                    - cell "U" [ref=e327]
                    - cell "V" [ref=e328]
                    - cell "W" [ref=e329]
                    - cell "X" [ref=e330]
                    - cell "Y" [ref=e331]
                    - cell "Z" [ref=e332]
                    - cell "A" [ref=e333]
                    - cell "B" [ref=e334]
                    - cell "C" [ref=e335]
                    - cell "D" [ref=e336]
                    - cell "E" [ref=e337]
                  - row "G G H I J K L M N O P Q R S T U V W X Y Z A B C D E F" [ref=e338]:
                    - cell "G" [ref=e339]
                    - cell "G" [ref=e340]
                    - cell "H" [ref=e341]
                    - cell "I" [ref=e342]
                    - cell "J" [ref=e343]
                    - cell "K" [ref=e344]
                    - cell "L" [ref=e345]
                    - cell "M" [ref=e346]
                    - cell "N" [ref=e347]
                    - cell "O" [ref=e348]
                    - cell "P" [ref=e349]
                    - cell "Q" [ref=e350]
                    - cell "R" [ref=e351]
                    - cell "S" [ref=e352]
                    - cell "T" [ref=e353]
                    - cell "U" [ref=e354]
                    - cell "V" [ref=e355]
                    - cell "W" [ref=e356]
                    - cell "X" [ref=e357]
                    - cell "Y" [ref=e358]
                    - cell "Z" [ref=e359]
                    - cell "A" [ref=e360]
                    - cell "B" [ref=e361]
                    - cell "C" [ref=e362]
                    - cell "D" [ref=e363]
                    - cell "E" [ref=e364]
                    - cell "F" [ref=e365]
                  - row "H H I J K L M N O P Q R S T U V W X Y Z A B C D E F G" [ref=e366]:
                    - cell "H" [ref=e367]
                    - cell "H" [ref=e368]
                    - cell "I" [ref=e369]
                    - cell "J" [ref=e370]
                    - cell "K" [ref=e371]
                    - cell "L" [ref=e372]
                    - cell "M" [ref=e373]
                    - cell "N" [ref=e374]
                    - cell "O" [ref=e375]
                    - cell "P" [ref=e376]
                    - cell "Q" [ref=e377]
                    - cell "R" [ref=e378]
                    - cell "S" [ref=e379]
                    - cell "T" [ref=e380]
                    - cell "U" [ref=e381]
                    - cell "V" [ref=e382]
                    - cell "W" [ref=e383]
                    - cell "X" [ref=e384]
                    - cell "Y" [ref=e385]
                    - cell "Z" [ref=e386]
                    - cell "A" [ref=e387]
                    - cell "B" [ref=e388]
                    - cell "C" [ref=e389]
                    - cell "D" [ref=e390]
                    - cell "E" [ref=e391]
                    - cell "F" [ref=e392]
                    - cell "G" [ref=e393]
                  - row "I I J K L M N O P Q R S T U V W X Y Z A B C D E F G H" [ref=e394]:
                    - cell "I" [ref=e395]
                    - cell "I" [ref=e396]
                    - cell "J" [ref=e397]
                    - cell "K" [ref=e398]
                    - cell "L" [ref=e399]
                    - cell "M" [ref=e400]
                    - cell "N" [ref=e401]
                    - cell "O" [ref=e402]
                    - cell "P" [ref=e403]
                    - cell "Q" [ref=e404]
                    - cell "R" [ref=e405]
                    - cell "S" [ref=e406]
                    - cell "T" [ref=e407]
                    - cell "U" [ref=e408]
                    - cell "V" [ref=e409]
                    - cell "W" [ref=e410]
                    - cell "X" [ref=e411]
                    - cell "Y" [ref=e412]
                    - cell "Z" [ref=e413]
                    - cell "A" [ref=e414]
                    - cell "B" [ref=e415]
                    - cell "C" [ref=e416]
                    - cell "D" [ref=e417]
                    - cell "E" [ref=e418]
                    - cell "F" [ref=e419]
                    - cell "G" [ref=e420]
                    - cell "H" [ref=e421]
                  - row "J J K L M N O P Q R S T U V W X Y Z A B C D E F G H I" [ref=e422]:
                    - cell "J" [ref=e423]
                    - cell "J" [ref=e424]
                    - cell "K" [ref=e425]
                    - cell "L" [ref=e426]
                    - cell "M" [ref=e427]
                    - cell "N" [ref=e428]
                    - cell "O" [ref=e429]
                    - cell "P" [ref=e430]
                    - cell "Q" [ref=e431]
                    - cell "R" [ref=e432]
                    - cell "S" [ref=e433]
                    - cell "T" [ref=e434]
                    - cell "U" [ref=e435]
                    - cell "V" [ref=e436]
                    - cell "W" [ref=e437]
                    - cell "X" [ref=e438]
                    - cell "Y" [ref=e439]
                    - cell "Z" [ref=e440]
                    - cell "A" [ref=e441]
                    - cell "B" [ref=e442]
                    - cell "C" [ref=e443]
                    - cell "D" [ref=e444]
                    - cell "E" [ref=e445]
                    - cell "F" [ref=e446]
                    - cell "G" [ref=e447]
                    - cell "H" [ref=e448]
                    - cell "I" [ref=e449]
                  - row "K K L M N O P Q R S T U V W X Y Z A B C D E F G H I J" [ref=e450]:
                    - cell "K" [ref=e451]
                    - cell "K" [ref=e452]
                    - cell "L" [ref=e453]
                    - cell "M" [ref=e454]
                    - cell "N" [ref=e455]
                    - cell "O" [ref=e456]
                    - cell "P" [ref=e457]
                    - cell "Q" [ref=e458]
                    - cell "R" [ref=e459]
                    - cell "S" [ref=e460]
                    - cell "T" [ref=e461]
                    - cell "U" [ref=e462]
                    - cell "V" [ref=e463]
                    - cell "W" [ref=e464]
                    - cell "X" [ref=e465]
                    - cell "Y" [ref=e466]
                    - cell "Z" [ref=e467]
                    - cell "A" [ref=e468]
                    - cell "B" [ref=e469]
                    - cell "C" [ref=e470]
                    - cell "D" [ref=e471]
                    - cell "E" [ref=e472]
                    - cell "F" [ref=e473]
                    - cell "G" [ref=e474]
                    - cell "H" [ref=e475]
                    - cell "I" [ref=e476]
                    - cell "J" [ref=e477]
                  - row "L L M N O P Q R S T U V W X Y Z A B C D E F G H I J K" [ref=e478]:
                    - cell "L" [ref=e479]
                    - cell "L" [ref=e480]
                    - cell "M" [ref=e481]
                    - cell "N" [ref=e482]
                    - cell "O" [ref=e483]
                    - cell "P" [ref=e484]
                    - cell "Q" [ref=e485]
                    - cell "R" [ref=e486]
                    - cell "S" [ref=e487]
                    - cell "T" [ref=e488]
                    - cell "U" [ref=e489]
                    - cell "V" [ref=e490]
                    - cell "W" [ref=e491]
                    - cell "X" [ref=e492]
                    - cell "Y" [ref=e493]
                    - cell "Z" [ref=e494]
                    - cell "A" [ref=e495]
                    - cell "B" [ref=e496]
                    - cell "C" [ref=e497]
                    - cell "D" [ref=e498]
                    - cell "E" [ref=e499]
                    - cell "F" [ref=e500]
                    - cell "G" [ref=e501]
                    - cell "H" [ref=e502]
                    - cell "I" [ref=e503]
                    - cell "J" [ref=e504]
                    - cell "K" [ref=e505]
                  - row "M M N O P Q R S T U V W X Y Z A B C D E F G H I J K L" [ref=e506]:
                    - cell "M" [ref=e507]
                    - cell "M" [ref=e508]
                    - cell "N" [ref=e509]
                    - cell "O" [ref=e510]
                    - cell "P" [ref=e511]
                    - cell "Q" [ref=e512]
                    - cell "R" [ref=e513]
                    - cell "S" [ref=e514]
                    - cell "T" [ref=e515]
                    - cell "U" [ref=e516]
                    - cell "V" [ref=e517]
                    - cell "W" [ref=e518]
                    - cell "X" [ref=e519]
                    - cell "Y" [ref=e520]
                    - cell "Z" [ref=e521]
                    - cell "A" [ref=e522]
                    - cell "B" [ref=e523]
                    - cell "C" [ref=e524]
                    - cell "D" [ref=e525]
                    - cell "E" [ref=e526]
                    - cell "F" [ref=e527]
                    - cell "G" [ref=e528]
                    - cell "H" [ref=e529]
                    - cell "I" [ref=e530]
                    - cell "J" [ref=e531]
                    - cell "K" [ref=e532]
                    - cell "L" [ref=e533]
                  - row "N N O P Q R S T U V W X Y Z A B C D E F G H I J K L M" [ref=e534]:
                    - cell "N" [ref=e535]
                    - cell "N" [ref=e536]
                    - cell "O" [ref=e537]
                    - cell "P" [ref=e538]
                    - cell "Q" [ref=e539]
                    - cell "R" [ref=e540]
                    - cell "S" [ref=e541]
                    - cell "T" [ref=e542]
                    - cell "U" [ref=e543]
                    - cell "V" [ref=e544]
                    - cell "W" [ref=e545]
                    - cell "X" [ref=e546]
                    - cell "Y" [ref=e547]
                    - cell "Z" [ref=e548]
                    - cell "A" [ref=e549]
                    - cell "B" [ref=e550]
                    - cell "C" [ref=e551]
                    - cell "D" [ref=e552]
                    - cell "E" [ref=e553]
                    - cell "F" [ref=e554]
                    - cell "G" [ref=e555]
                    - cell "H" [ref=e556]
                    - cell "I" [ref=e557]
                    - cell "J" [ref=e558]
                    - cell "K" [ref=e559]
                    - cell "L" [ref=e560]
                    - cell "M" [ref=e561]
                  - row "O O P Q R S T U V W X Y Z A B C D E F G H I J K L M N" [ref=e562]:
                    - cell "O" [ref=e563]
                    - cell "O" [ref=e564]
                    - cell "P" [ref=e565]
                    - cell "Q" [ref=e566]
                    - cell "R" [ref=e567]
                    - cell "S" [ref=e568]
                    - cell "T" [ref=e569]
                    - cell "U" [ref=e570]
                    - cell "V" [ref=e571]
                    - cell "W" [ref=e572]
                    - cell "X" [ref=e573]
                    - cell "Y" [ref=e574]
                    - cell "Z" [ref=e575]
                    - cell "A" [ref=e576]
                    - cell "B" [ref=e577]
                    - cell "C" [ref=e578]
                    - cell "D" [ref=e579]
                    - cell "E" [ref=e580]
                    - cell "F" [ref=e581]
                    - cell "G" [ref=e582]
                    - cell "H" [ref=e583]
                    - cell "I" [ref=e584]
                    - cell "J" [ref=e585]
                    - cell "K" [ref=e586]
                    - cell "L" [ref=e587]
                    - cell "M" [ref=e588]
                    - cell "N" [ref=e589]
                  - row "P P Q R S T U V W X Y Z A B C D E F G H I J K L M N O" [ref=e590]:
                    - cell "P" [ref=e591]
                    - cell "P" [ref=e592]
                    - cell "Q" [ref=e593]
                    - cell "R" [ref=e594]
                    - cell "S" [ref=e595]
                    - cell "T" [ref=e596]
                    - cell "U" [ref=e597]
                    - cell "V" [ref=e598]
                    - cell "W" [ref=e599]
                    - cell "X" [ref=e600]
                    - cell "Y" [ref=e601]
                    - cell "Z" [ref=e602]
                    - cell "A" [ref=e603]
                    - cell "B" [ref=e604]
                    - cell "C" [ref=e605]
                    - cell "D" [ref=e606]
                    - cell "E" [ref=e607]
                    - cell "F" [ref=e608]
                    - cell "G" [ref=e609]
                    - cell "H" [ref=e610]
                    - cell "I" [ref=e611]
                    - cell "J" [ref=e612]
                    - cell "K" [ref=e613]
                    - cell "L" [ref=e614]
                    - cell "M" [ref=e615]
                    - cell "N" [ref=e616]
                    - cell "O" [ref=e617]
                  - row "Q Q R S T U V W X Y Z A B C D E F G H I J K L M N O P" [ref=e618]:
                    - cell "Q" [ref=e619]
                    - cell "Q" [ref=e620]
                    - cell "R" [ref=e621]
                    - cell "S" [ref=e622]
                    - cell "T" [ref=e623]
                    - cell "U" [ref=e624]
                    - cell "V" [ref=e625]
                    - cell "W" [ref=e626]
                    - cell "X" [ref=e627]
                    - cell "Y" [ref=e628]
                    - cell "Z" [ref=e629]
                    - cell "A" [ref=e630]
                    - cell "B" [ref=e631]
                    - cell "C" [ref=e632]
                    - cell "D" [ref=e633]
                    - cell "E" [ref=e634]
                    - cell "F" [ref=e635]
                    - cell "G" [ref=e636]
                    - cell "H" [ref=e637]
                    - cell "I" [ref=e638]
                    - cell "J" [ref=e639]
                    - cell "K" [ref=e640]
                    - cell "L" [ref=e641]
                    - cell "M" [ref=e642]
                    - cell "N" [ref=e643]
                    - cell "O" [ref=e644]
                    - cell "P" [ref=e645]
                  - row "R R S T U V W X Y Z A B C D E F G H I J K L M N O P Q" [ref=e646]:
                    - cell "R" [ref=e647]
                    - cell "R" [ref=e648]
                    - cell "S" [ref=e649]
                    - cell "T" [ref=e650]
                    - cell "U" [ref=e651]
                    - cell "V" [ref=e652]
                    - cell "W" [ref=e653]
                    - cell "X" [ref=e654]
                    - cell "Y" [ref=e655]
                    - cell "Z" [ref=e656]
                    - cell "A" [ref=e657]
                    - cell "B" [ref=e658]
                    - cell "C" [ref=e659]
                    - cell "D" [ref=e660]
                    - cell "E" [ref=e661]
                    - cell "F" [ref=e662]
                    - cell "G" [ref=e663]
                    - cell "H" [ref=e664]
                    - cell "I" [ref=e665]
                    - cell "J" [ref=e666]
                    - cell "K" [ref=e667]
                    - cell "L" [ref=e668]
                    - cell "M" [ref=e669]
                    - cell "N" [ref=e670]
                    - cell "O" [ref=e671]
                    - cell "P" [ref=e672]
                    - cell "Q" [ref=e673]
                  - row "S S T U V W X Y Z A B C D E F G H I J K L M N O P Q R" [ref=e674]:
                    - cell "S" [ref=e675]
                    - cell "S" [ref=e676]
                    - cell "T" [ref=e677]
                    - cell "U" [ref=e678]
                    - cell "V" [ref=e679]
                    - cell "W" [ref=e680]
                    - cell "X" [ref=e681]
                    - cell "Y" [ref=e682]
                    - cell "Z" [ref=e683]
                    - cell "A" [ref=e684]
                    - cell "B" [ref=e685]
                    - cell "C" [ref=e686]
                    - cell "D" [ref=e687]
                    - cell "E" [ref=e688]
                    - cell "F" [ref=e689]
                    - cell "G" [ref=e690]
                    - cell "H" [ref=e691]
                    - cell "I" [ref=e692]
                    - cell "J" [ref=e693]
                    - cell "K" [ref=e694]
                    - cell "L" [ref=e695]
                    - cell "M" [ref=e696]
                    - cell "N" [ref=e697]
                    - cell "O" [ref=e698]
                    - cell "P" [ref=e699]
                    - cell "Q" [ref=e700]
                    - cell "R" [ref=e701]
                  - row "T T U V W X Y Z A B C D E F G H I J K L M N O P Q R S" [ref=e702]:
                    - cell "T" [ref=e703]
                    - cell "T" [ref=e704]
                    - cell "U" [ref=e705]
                    - cell "V" [ref=e706]
                    - cell "W" [ref=e707]
                    - cell "X" [ref=e708]
                    - cell "Y" [ref=e709]
                    - cell "Z" [ref=e710]
                    - cell "A" [ref=e711]
                    - cell "B" [ref=e712]
                    - cell "C" [ref=e713]
                    - cell "D" [ref=e714]
                    - cell "E" [ref=e715]
                    - cell "F" [ref=e716]
                    - cell "G" [ref=e717]
                    - cell "H" [ref=e718]
                    - cell "I" [ref=e719]
                    - cell "J" [ref=e720]
                    - cell "K" [ref=e721]
                    - cell "L" [ref=e722]
                    - cell "M" [ref=e723]
                    - cell "N" [ref=e724]
                    - cell "O" [ref=e725]
                    - cell "P" [ref=e726]
                    - cell "Q" [ref=e727]
                    - cell "R" [ref=e728]
                    - cell "S" [ref=e729]
                  - row "U U V W X Y Z A B C D E F G H I J K L M N O P Q R S T" [ref=e730]:
                    - cell "U" [ref=e731]
                    - cell "U" [ref=e732]
                    - cell "V" [ref=e733]
                    - cell "W" [ref=e734]
                    - cell "X" [ref=e735]
                    - cell "Y" [ref=e736]
                    - cell "Z" [ref=e737]
                    - cell "A" [ref=e738]
                    - cell "B" [ref=e739]
                    - cell "C" [ref=e740]
                    - cell "D" [ref=e741]
                    - cell "E" [ref=e742]
                    - cell "F" [ref=e743]
                    - cell "G" [ref=e744]
                    - cell "H" [ref=e745]
                    - cell "I" [ref=e746]
                    - cell "J" [ref=e747]
                    - cell "K" [ref=e748]
                    - cell "L" [ref=e749]
                    - cell "M" [ref=e750]
                    - cell "N" [ref=e751]
                    - cell "O" [ref=e752]
                    - cell "P" [ref=e753]
                    - cell "Q" [ref=e754]
                    - cell "R" [ref=e755]
                    - cell "S" [ref=e756]
                    - cell "T" [ref=e757]
                  - row "V V W X Y Z A B C D E F G H I J K L M N O P Q R S T U" [ref=e758]:
                    - cell "V" [ref=e759]
                    - cell "V" [ref=e760]
                    - cell "W" [ref=e761]
                    - cell "X" [ref=e762]
                    - cell "Y" [ref=e763]
                    - cell "Z" [ref=e764]
                    - cell "A" [ref=e765]
                    - cell "B" [ref=e766]
                    - cell "C" [ref=e767]
                    - cell "D" [ref=e768]
                    - cell "E" [ref=e769]
                    - cell "F" [ref=e770]
                    - cell "G" [ref=e771]
                    - cell "H" [ref=e772]
                    - cell "I" [ref=e773]
                    - cell "J" [ref=e774]
                    - cell "K" [ref=e775]
                    - cell "L" [ref=e776]
                    - cell "M" [ref=e777]
                    - cell "N" [ref=e778]
                    - cell "O" [ref=e779]
                    - cell "P" [ref=e780]
                    - cell "Q" [ref=e781]
                    - cell "R" [ref=e782]
                    - cell "S" [ref=e783]
                    - cell "T" [ref=e784]
                    - cell "U" [ref=e785]
                  - row "W W X Y Z A B C D E F G H I J K L M N O P Q R S T U V" [ref=e786]:
                    - cell "W" [ref=e787]
                    - cell "W" [ref=e788]
                    - cell "X" [ref=e789]
                    - cell "Y" [ref=e790]
                    - cell "Z" [ref=e791]
                    - cell "A" [ref=e792]
                    - cell "B" [ref=e793]
                    - cell "C" [ref=e794]
                    - cell "D" [ref=e795]
                    - cell "E" [ref=e796]
                    - cell "F" [ref=e797]
                    - cell "G" [ref=e798]
                    - cell "H" [ref=e799]
                    - cell "I" [ref=e800]
                    - cell "J" [ref=e801]
                    - cell "K" [ref=e802]
                    - cell "L" [ref=e803]
                    - cell "M" [ref=e804]
                    - cell "N" [ref=e805]
                    - cell "O" [ref=e806]
                    - cell "P" [ref=e807]
                    - cell "Q" [ref=e808]
                    - cell "R" [ref=e809]
                    - cell "S" [ref=e810]
                    - cell "T" [ref=e811]
                    - cell "U" [ref=e812]
                    - cell "V" [ref=e813]
                  - row "X X Y Z A B C D E F G H I J K L M N O P Q R S T U V W" [ref=e814]:
                    - cell "X" [ref=e815]
                    - cell "X" [ref=e816]
                    - cell "Y" [ref=e817]
                    - cell "Z" [ref=e818]
                    - cell "A" [ref=e819]
                    - cell "B" [ref=e820]
                    - cell "C" [ref=e821]
                    - cell "D" [ref=e822]
                    - cell "E" [ref=e823]
                    - cell "F" [ref=e824]
                    - cell "G" [ref=e825]
                    - cell "H" [ref=e826]
                    - cell "I" [ref=e827]
                    - cell "J" [ref=e828]
                    - cell "K" [ref=e829]
                    - cell "L" [ref=e830]
                    - cell "M" [ref=e831]
                    - cell "N" [ref=e832]
                    - cell "O" [ref=e833]
                    - cell "P" [ref=e834]
                    - cell "Q" [ref=e835]
                    - cell "R" [ref=e836]
                    - cell "S" [ref=e837]
                    - cell "T" [ref=e838]
                    - cell "U" [ref=e839]
                    - cell "V" [ref=e840]
                    - cell "W" [ref=e841]
                  - row "Y Y Z A B C D E F G H I J K L M N O P Q R S T U V W X" [ref=e842]:
                    - cell "Y" [ref=e843]
                    - cell "Y" [ref=e844]
                    - cell "Z" [ref=e845]
                    - cell "A" [ref=e846]
                    - cell "B" [ref=e847]
                    - cell "C" [ref=e848]
                    - cell "D" [ref=e849]
                    - cell "E" [ref=e850]
                    - cell "F" [ref=e851]
                    - cell "G" [ref=e852]
                    - cell "H" [ref=e853]
                    - cell "I" [ref=e854]
                    - cell "J" [ref=e855]
                    - cell "K" [ref=e856]
                    - cell "L" [ref=e857]
                    - cell "M" [ref=e858]
                    - cell "N" [ref=e859]
                    - cell "O" [ref=e860]
                    - cell "P" [ref=e861]
                    - cell "Q" [ref=e862]
                    - cell "R" [ref=e863]
                    - cell "S" [ref=e864]
                    - cell "T" [ref=e865]
                    - cell "U" [ref=e866]
                    - cell "V" [ref=e867]
                    - cell "W" [ref=e868]
                    - cell "X" [ref=e869]
                  - row "Z Z A B C D E F G H I J K L M N O P Q R S T U V W X Y" [ref=e870]:
                    - cell "Z" [ref=e871]
                    - cell "Z" [ref=e872]
                    - cell "A" [ref=e873]
                    - cell "B" [ref=e874]
                    - cell "C" [ref=e875]
                    - cell "D" [ref=e876]
                    - cell "E" [ref=e877]
                    - cell "F" [ref=e878]
                    - cell "G" [ref=e879]
                    - cell "H" [ref=e880]
                    - cell "I" [ref=e881]
                    - cell "J" [ref=e882]
                    - cell "K" [ref=e883]
                    - cell "L" [ref=e884]
                    - cell "M" [ref=e885]
                    - cell "N" [ref=e886]
                    - cell "O" [ref=e887]
                    - cell "P" [ref=e888]
                    - cell "Q" [ref=e889]
                    - cell "R" [ref=e890]
                    - cell "S" [ref=e891]
                    - cell "T" [ref=e892]
                    - cell "U" [ref=e893]
                    - cell "V" [ref=e894]
                    - cell "W" [ref=e895]
                    - cell "X" [ref=e896]
                    - cell "Y" [ref=e897]
              - generic [ref=e898]:
                - generic [ref=e899]:
                  - button "Step Backward" [ref=e900] [cursor=pointer]: ⏮
                  - button "Play" [ref=e901] [cursor=pointer]
                  - button "Step Forward" [ref=e902] [cursor=pointer]: ⏭
                  - button "Reset" [ref=e903] [cursor=pointer]: 🔄
                - generic [ref=e904]:
                  - generic [ref=e905]: "Speed:"
                  - slider "Speed:" [ref=e906]: "1000"
                  - generic [ref=e907]: 1000ms
        - generic [ref=e908]:
          - heading "Affine Cipher" [level=3] [ref=e909]
          - paragraph [ref=e910]: "A mathematical substitution cipher where each letter is mapped to its numeric equivalent, encrypted via the formula: E(x) = (ax + b) mod 26."
          - generic [ref=e911]:
            - generic [ref=e912]:
              - generic [ref=e913]:
                - generic [ref=e914]: Input Text (Max 500 Chars)
                - textbox "Input Text (Max 500 Chars)" [ref=e915]:
                  - /placeholder: Enter secret message...
              - generic [ref=e916]:
                - generic [ref=e917]:
                  - generic [ref=e918]: Key a
                  - textbox "Key a" [ref=e919]: "5"
                - generic [ref=e920]:
                  - generic [ref=e921]: Key b
                  - textbox "Key b" [ref=e922]: "8"
                - generic [ref=e923]:
                  - generic [ref=e924]: Mode Select
                  - combobox "Mode Select" [ref=e925]:
                    - option "Encrypt" [selected]
                    - option "Decrypt"
              - generic [ref=e926]:
                - button "Encrypt Mode" [ref=e927] [cursor=pointer]
                - button "Decrypt Mode" [ref=e928] [cursor=pointer]
              - generic [ref=e930]: Output Text
            - generic [ref=e932]:
              - heading "Mathematical Formula Visualizer" [level=4] [ref=e933]
              - generic [ref=e935]:
                - text: E(x) = (5x + 8) mod 26
                - generic [ref=e936]: E(0) = (5 × 0 + 8) mod 26 = 8
              - img [ref=e938]:
                - generic [ref=e939]:
                  - generic [ref=e941]: A
                  - generic [ref=e943]: a
                - generic [ref=e945]:
                  - generic [ref=e947]: B
                  - generic [ref=e949]: b
                - generic [ref=e950]:
                  - generic [ref=e952]: C
                  - generic [ref=e954]: c
                - generic [ref=e955]:
                  - generic [ref=e957]: D
                  - generic [ref=e959]: d
                - generic [ref=e960]:
                  - generic [ref=e962]: E
                  - generic [ref=e964]: e
                - generic [ref=e965]:
                  - generic [ref=e967]: F
                  - generic [ref=e969]: f
                - generic [ref=e970]:
                  - generic [ref=e972]: G
                  - generic [ref=e974]: g
                - generic [ref=e975]:
                  - generic [ref=e977]: H
                  - generic [ref=e979]: h
                - generic [ref=e980]:
                  - generic [ref=e982]: I
                  - generic [ref=e984]: i
                - generic [ref=e985]:
                  - generic [ref=e987]: J
                  - generic [ref=e989]: j
                - generic [ref=e990]:
                  - generic [ref=e992]: K
                  - generic [ref=e994]: k
                - generic [ref=e995]:
                  - generic [ref=e997]: L
                  - generic [ref=e999]: l
                - generic [ref=e1000]:
                  - generic [ref=e1002]: M
                  - generic [ref=e1004]: m
                - generic [ref=e1005]:
                  - generic [ref=e1007]: "N"
                  - generic [ref=e1009]: "n"
                - generic [ref=e1010]:
                  - generic [ref=e1012]: O
                  - generic [ref=e1014]: o
                - generic [ref=e1015]:
                  - generic [ref=e1017]: P
                  - generic [ref=e1019]: p
                - generic [ref=e1020]:
                  - generic [ref=e1022]: Q
                  - generic [ref=e1024]: q
                - generic [ref=e1025]:
                  - generic [ref=e1027]: R
                  - generic [ref=e1029]: r
                - generic [ref=e1030]:
                  - generic [ref=e1032]: S
                  - generic [ref=e1034]: s
                - generic [ref=e1035]:
                  - generic [ref=e1037]: T
                  - generic [ref=e1039]: t
                - generic [ref=e1040]:
                  - generic [ref=e1042]: U
                  - generic [ref=e1044]: u
                - generic [ref=e1045]:
                  - generic [ref=e1047]: V
                  - generic [ref=e1049]: v
                - generic [ref=e1050]:
                  - generic [ref=e1052]: W
                  - generic [ref=e1054]: w
                - generic [ref=e1055]:
                  - generic [ref=e1057]: X
                  - generic [ref=e1059]: x
                - generic [ref=e1060]:
                  - generic [ref=e1062]: "Y"
                  - generic [ref=e1064]: "y"
                - generic [ref=e1065]:
                  - generic [ref=e1067]: Z
                  - generic [ref=e1069]: z
              - generic [ref=e1070]:
                - generic [ref=e1071]:
                  - button "Step Backward" [ref=e1072] [cursor=pointer]: ⏮
                  - button "Play" [ref=e1073] [cursor=pointer]
                  - button "Step Forward" [ref=e1074] [cursor=pointer]: ⏭
                  - button "Reset" [ref=e1075] [cursor=pointer]: 🔄
                - generic [ref=e1076]:
                  - generic [ref=e1077]: "Speed:"
                  - slider "Speed:" [ref=e1078]: "1000"
                  - generic [ref=e1079]: 1000ms
        - generic [ref=e1080]:
          - heading "Scytale Cipher" [level=3] [ref=e1081]
          - paragraph [ref=e1082]: A transposition cipher used by the ancient Greeks, consisting of a cylinder with a strip of parchment wrapped around it.
          - generic [ref=e1083]:
            - generic [ref=e1084]:
              - generic [ref=e1085]:
                - generic [ref=e1086]: Input Text (Max 500 Chars)
                - textbox "Input Text (Max 500 Chars)" [ref=e1087]:
                  - /placeholder: Enter secret message...
              - generic [ref=e1088]:
                - generic [ref=e1089]:
                  - generic [ref=e1090]: Cylinder Width (Diameter)
                  - textbox "Cylinder Width (Diameter)" [ref=e1091]: "4"
                - generic [ref=e1092]:
                  - generic [ref=e1093]: Action
                  - generic [ref=e1094]:
                    - button "Encrypt" [ref=e1095] [cursor=pointer]
                    - button "Decrypt" [ref=e1096] [cursor=pointer]
              - generic [ref=e1097]:
                - generic [ref=e1098]:
                  - generic [ref=e1099]: "Step: 1 / 1"
                  - generic [ref=e1100]:
                    - button "Step Backward" [disabled] [ref=e1101]: ⏮️
                    - button "Play" [ref=e1102] [cursor=pointer]: ▶️
                    - button "Step Forward" [disabled] [ref=e1103]: ⏭️
                    - button "Reset" [ref=e1104] [cursor=pointer]: 🔄
                - generic [ref=e1105]:
                  - generic [ref=e1106]: Speed
                  - slider "Speed" [ref=e1107] [cursor=pointer]: "1000"
                  - generic [ref=e1108]: 1000ms
            - generic [ref=e1109]:
              - img [ref=e1111]
              - generic [ref=e1116]: Output Text
        - generic [ref=e1118]:
          - heading "Polybius Square" [level=3] [ref=e1119]
          - paragraph [ref=e1120]: A device invented by the ancient Greeks for fractionating letters into grid coordinates (1-5 for rows and columns).
          - generic [ref=e1121]:
            - generic [ref=e1122]:
              - generic [ref=e1123]:
                - generic [ref=e1124]: Input Text (Max 500 Chars)
                - textbox "Input Text (Max 500 Chars)" [ref=e1125]:
                  - /placeholder: Enter message (letters for encrypt, coordinate pairs for decrypt)...
                  - text: 23 15 31 31 34
              - generic [ref=e1126]:
                - generic [ref=e1127]:
                  - generic [ref=e1128]: Grid Key (25 letters)
                  - textbox "Grid Key (25 letters)" [ref=e1129]: abcdefghiklmnopqrstuvwxyz
                - generic [ref=e1130]:
                  - generic [ref=e1131]: Action
                  - generic [ref=e1132]:
                    - button "Encrypt" [ref=e1133] [cursor=pointer]
                    - button "Decrypt" [active] [ref=e1134] [cursor=pointer]
              - generic [ref=e1135]:
                - generic [ref=e1136]:
                  - generic [ref=e1137]: "Step: 1 / 14"
                  - generic [ref=e1138]:
                    - button "Step Backward" [disabled] [ref=e1139]: ⏮️
                    - button "Play" [ref=e1140] [cursor=pointer]: ▶️
                    - button "Step Forward" [ref=e1141] [cursor=pointer]: ⏭️
                    - button "Reset" [ref=e1142] [cursor=pointer]: 🔄
                - generic [ref=e1143]:
                  - generic [ref=e1144]: Speed
                  - slider "Speed" [ref=e1145] [cursor=pointer]: "1000"
                  - generic [ref=e1146]: 1000ms
            - generic [ref=e1147]:
              - table [ref=e1149]:
                - rowgroup [ref=e1150]:
                  - row "1 2 3 4 5" [ref=e1151]:
                    - columnheader [ref=e1152]
                    - columnheader "1" [ref=e1153]
                    - columnheader "2" [ref=e1154]
                    - columnheader "3" [ref=e1155]
                    - columnheader "4" [ref=e1156]
                    - columnheader "5" [ref=e1157]
                - rowgroup [ref=e1158]:
                  - row "1 A B C D E" [ref=e1159]:
                    - rowheader "1" [ref=e1160]
                    - cell "A" [ref=e1161]
                    - cell "B" [ref=e1162]
                    - cell "C" [ref=e1163]
                    - cell "D" [ref=e1164]
                    - cell "E" [ref=e1165]
                  - row "2 F G H I K" [ref=e1166]:
                    - rowheader "2" [ref=e1167]
                    - cell "F" [ref=e1168]
                    - cell "G" [ref=e1169]
                    - cell "H" [ref=e1170]
                    - cell "I" [ref=e1171]
                    - cell "K" [ref=e1172]
                  - row "3 L M N O P" [ref=e1173]:
                    - rowheader "3" [ref=e1174]
                    - cell "L" [ref=e1175]
                    - cell "M" [ref=e1176]
                    - cell "N" [ref=e1177]
                    - cell "O" [ref=e1178]
                    - cell "P" [ref=e1179]
                  - row "4 Q R S T U" [ref=e1180]:
                    - rowheader "4" [ref=e1181]
                    - cell "Q" [ref=e1182]
                    - cell "R" [ref=e1183]
                    - cell "S" [ref=e1184]
                    - cell "T" [ref=e1185]
                    - cell "U" [ref=e1186]
                  - row "5 V W X Y Z" [ref=e1187]:
                    - rowheader "5" [ref=e1188]
                    - cell "V" [ref=e1189]
                    - cell "W" [ref=e1190]
                    - cell "X" [ref=e1191]
                    - cell "Y" [ref=e1192]
                    - cell "Z" [ref=e1193]
              - generic [ref=e1194]:
                - generic [ref=e1195]: Output Text
                - generic [ref=e1196]: h e l l o
        - generic [ref=e1197]:
          - heading "Enigma Machine" [level=3] [ref=e1198]
          - paragraph [ref=e1199]: The legendary electro-mechanical rotor cipher machine used in WWII, featuring configurable rotors, ring settings, and plugboard connections.
          - generic [ref=e1200]:
            - generic [ref=e1201]:
              - generic [ref=e1202]:
                - generic [ref=e1203]: Input Text (Max 500 Chars)
                - textbox "Input Text (Max 500 Chars)" [ref=e1204]:
                  - /placeholder: Enter message to encipher (A-Z only)...
              - generic [ref=e1205]:
                - generic [ref=e1206]:
                  - generic [ref=e1207]: Rotors (e.g. I-II-III)
                  - textbox "Rotors (e.g. I-II-III)" [ref=e1208]: I-II-III
                - generic [ref=e1209]:
                  - generic [ref=e1210]: Initial Positions (e.g. A-A-A)
                  - textbox "Initial Positions (e.g. A-A-A)" [ref=e1211]: A-A-A
              - generic [ref=e1212]:
                - generic [ref=e1213]:
                  - generic [ref=e1214]: Ring Settings (e.g. A-A-A or 1-1-1)
                  - textbox "Ring Settings (e.g. A-A-A or 1-1-1)" [ref=e1215]: A-A-A
                - generic [ref=e1216]:
                  - generic [ref=e1217]: Plugboard Swaps (e.g. AB CD)
                  - textbox "Plugboard Swaps (e.g. AB CD)" [ref=e1218]
              - button "Encipher Message" [ref=e1219] [cursor=pointer]
              - generic [ref=e1220]:
                - generic [ref=e1221]:
                  - generic [ref=e1222]: "Step: 1 / 1"
                  - generic [ref=e1223]:
                    - button "Step Backward" [disabled] [ref=e1224]: ⏮️
                    - button "Play" [ref=e1225] [cursor=pointer]: ▶️
                    - button "Step Forward" [disabled] [ref=e1226]: ⏭️
                    - button "Reset" [ref=e1227] [cursor=pointer]: 🔄
                - generic [ref=e1228]:
                  - generic [ref=e1229]: Speed
                  - slider "Speed" [ref=e1230] [cursor=pointer]: "1000"
                  - generic [ref=e1231]: 1000ms
            - generic [ref=e1232]:
              - img [ref=e1234]:
                - generic [ref=e1235]: REFL
                - generic [ref=e1236]: ROTOR 1 (A)
                - generic [ref=e1237]: ROTOR 2 (A)
                - generic [ref=e1238]: ROTOR 3 (A)
                - generic [ref=e1239]: PLUG/KB
              - generic [ref=e1475]: Output Text
        - generic [ref=e1477]:
          - generic [ref=e1478]:
            - generic [ref=e1479]:
              - heading "AES Cipher" [level=3] [ref=e1480]
              - paragraph [ref=e1481]: Advanced Encryption Standard (AES-256 CTR Mode)
            - combobox [ref=e1483]:
              - option "Encrypt Mode" [selected]
              - option "Decrypt Mode"
          - generic [ref=e1484]:
            - generic [ref=e1485]:
              - generic [ref=e1486]:
                - generic [ref=e1487]: Input String
                - textbox "Input String" [ref=e1488]:
                  - /placeholder: Enter text or hex to encrypt/decrypt...
              - generic [ref=e1489]:
                - generic [ref=e1490]:
                  - generic [ref=e1491]: Input Format
                  - combobox "Input Format" [ref=e1492]:
                    - option "Plain Text" [selected]
                    - option "Hexadecimal"
                - generic [ref=e1493]:
                  - generic [ref=e1494]: Key Format
                  - combobox "Key Format" [ref=e1495]:
                    - option "Plain Text" [selected]
                    - option "Hexadecimal"
              - generic [ref=e1496]:
                - generic [ref=e1497]: Cipher Key (16 or 32 bytes)
                - textbox "Cipher Key (16 or 32 bytes)" [ref=e1498]: "1234567890123456"
              - generic [ref=e1499]:
                - button "Encrypt" [ref=e1500] [cursor=pointer]
                - button "Decrypt" [ref=e1501] [cursor=pointer]
              - generic [ref=e1502]:
                - generic [ref=e1503]:
                  - generic [ref=e1504]: "Round: 0 / 10"
                  - generic [ref=e1505]:
                    - button "Step Backward" [disabled] [ref=e1506]: ⏮️
                    - button "Play" [ref=e1507] [cursor=pointer]: ▶️
                    - button "Step Forward" [ref=e1508] [cursor=pointer]: ⏭️
                    - button "Reset" [ref=e1509] [cursor=pointer]: 🔄
                - generic [ref=e1510]:
                  - generic [ref=e1511]: Speed
                  - slider "Speed" [ref=e1512] [cursor=pointer]: "1000"
                  - generic [ref=e1513]: 1000ms
            - generic [ref=e1514]:
              - generic [ref=e1515]:
                - generic [ref=e1516]: AES-256 CTR Block Diagram & Visualizer
                - generic [ref=e1517]:
                  - generic [ref=e1518]: "Round 0 Operation:"
                  - generic [ref=e1519]: AddRoundKey (Pre-round)
                - generic [ref=e1520]:
                  - generic [ref=e1521]: 1. Key Expansion (generating round keys 0-10)
                  - generic [ref=e1522]: "2. SubBytes: S-Box non-linear byte substitution"
                  - generic [ref=e1523]: "3. ShiftRows: Cyclic shift of rows in state matrix"
                  - generic [ref=e1524]: "4. MixColumns: Column transformation in GF(2^8)"
                  - generic [ref=e1526]: "5. AddRoundKey: XOR with round key W[0..3]"
                - img [ref=e1528]:
                  - generic [ref=e1530]: Plaintext
                  - generic [ref=e1532]: AES CTR Round 0
                  - generic [ref=e1533]: Counter + Nonce
                  - generic [ref=e1535]: Output
              - generic [ref=e1537]: Output Text
        - generic [ref=e1539]:
          - generic [ref=e1540]:
            - generic [ref=e1541]:
              - heading "RSA Cipher" [level=3] [ref=e1542]
              - paragraph [ref=e1543]: Asymmetric Cryptography (Modular Exponentiation)
            - combobox [ref=e1545]:
              - option "Encrypt Mode" [selected]
              - option "Decrypt Mode"
          - generic [ref=e1546]:
            - generic [ref=e1547]:
              - generic [ref=e1548]:
                - generic [ref=e1549]: Key Generation Panel
                - generic [ref=e1550]:
                  - generic [ref=e1551]:
                    - generic [ref=e1552]: Prime p
                    - spinbutton "Prime p" [ref=e1553]: "61"
                  - generic [ref=e1554]:
                    - generic [ref=e1555]: Prime q
                    - spinbutton "Prime q" [ref=e1556]: "53"
                  - generic [ref=e1557]:
                    - generic [ref=e1558]: Exponent e
                    - spinbutton "Exponent e" [ref=e1559]: "65537"
                - button "Generate RSA Keys" [ref=e1560] [cursor=pointer]
                - generic [ref=e1561]:
                  - generic [ref=e1562]: "Modulus (n):"
                  - generic [ref=e1564]: "Public Key (PEM):"
              - generic [ref=e1566]:
                - generic [ref=e1567]: Input Message (Number or Text)
                - textbox "Input Message (Number or Text)" [ref=e1568]:
                  - /placeholder: Enter message to encrypt or decrypt...
              - generic [ref=e1569]:
                - button "Encrypt" [ref=e1570] [cursor=pointer]
                - button "Decrypt" [ref=e1571] [cursor=pointer]
              - generic [ref=e1572]:
                - generic [ref=e1573]:
                  - generic [ref=e1574]: "Step: 1 / 5"
                  - generic [ref=e1575]:
                    - button "Step Backward" [disabled] [ref=e1576]: ⏮️
                    - button "Play" [ref=e1577] [cursor=pointer]: ▶️
                    - button "Step Forward" [ref=e1578] [cursor=pointer]: ⏭️
                    - button "Reset" [ref=e1579] [cursor=pointer]: 🔄
                - generic [ref=e1580]:
                  - generic [ref=e1581]: Speed
                  - slider "Speed" [ref=e1582] [cursor=pointer]: "1000"
                  - generic [ref=e1583]: 1000ms
            - generic [ref=e1584]:
              - generic [ref=e1585]:
                - generic [ref=e1586]: RSA Mathematical Flow & Diagram
                - generic [ref=e1587]:
                  - generic [ref=e1588]:
                    - text: "Step 1: Choose Primes"
                    - paragraph [ref=e1589]: "Select distinct prime numbers: p = 61, q = 53"
                  - generic [ref=e1590]:
                    - text: "Step 2: Modulus & Totient"
                    - paragraph [ref=e1591]:
                      - text: n = p * q = ?
                      - text: phi(n) = (p-1)*(q-1) = ?
                  - generic [ref=e1592]:
                    - text: "Step 3: Keys Exponent"
                    - paragraph [ref=e1593]:
                      - text: Public e = 65537
                      - text: Private d = e⁻¹ mod phi = ?
                  - generic [ref=e1594]:
                    - text: "Step 4: Encryption"
                    - paragraph [ref=e1595]: Cipher C = M^e mod n
                - generic [ref=e1596]:
                  - generic [ref=e1597]:
                    - generic [ref=e1598]: "Modulus definition:"
                    - generic [ref=e1599]: n = p * q
                  - generic [ref=e1600]:
                    - generic [ref=e1601]: "Totient Relation:"
                    - generic [ref=e1602]: d * e ≡ 1 (mod phi)
                  - generic [ref=e1603]:
                    - generic [ref=e1604]: "Decryption Relation:"
                    - generic [ref=e1605]: M = C^d mod n
                - img [ref=e1607]:
                  - generic [ref=e1609]: Message (M)
                  - generic [ref=e1611]: exponentiation
                  - generic [ref=e1612]: mod n
                  - generic [ref=e1614]: Cipher (C)
              - generic [ref=e1616]: Output Text
        - generic [ref=e1618]:
          - generic [ref=e1620]:
            - heading "SHA-256 Hash" [level=3] [ref=e1621]
            - paragraph [ref=e1622]: Cryptographic Secure Hash Algorithm (256-bit Digest)
          - generic [ref=e1623]:
            - generic [ref=e1624]:
              - generic [ref=e1625]:
                - generic [ref=e1626]: Input Plaintext
                - textbox "Input Plaintext" [ref=e1627]:
                  - /placeholder: Enter text to hash...
              - generic [ref=e1628]:
                - button "Hash (encrypt-btn)" [ref=e1629] [cursor=pointer]
                - button "Compute SHA-256" [ref=e1630] [cursor=pointer]
              - generic [ref=e1631]:
                - generic [ref=e1632]:
                  - generic [ref=e1633]: "Step: 1 / 4"
                  - generic [ref=e1634]:
                    - button "Step Backward" [disabled] [ref=e1635]: ⏮️
                    - button "Play" [ref=e1636] [cursor=pointer]: ▶️
                    - button "Step Forward" [ref=e1637] [cursor=pointer]: ⏭️
                    - button "Reset" [ref=e1638] [cursor=pointer]: 🔄
                - generic [ref=e1639]:
                  - generic [ref=e1640]: Speed
                  - slider "Speed" [ref=e1641] [cursor=pointer]: "1000"
                  - generic [ref=e1642]: 1000ms
            - generic [ref=e1643]:
              - generic [ref=e1644]:
                - generic [ref=e1645]: SHA-256 Block & Message Padding representation
                - generic [ref=e1646]:
                  - generic [ref=e1647]:
                    - generic [ref=e1648]:
                      - generic [ref=e1649]: "Message length:"
                      - generic [ref=e1650]: 0 bits
                    - generic [ref=e1651]:
                      - generic [ref=e1652]: "Padding added (1 + zeros):"
                      - generic [ref=e1653]: pad 1 bit + 447 zero bits
                    - generic [ref=e1654]:
                      - generic [ref=e1655]: "Total Padded size:"
                      - generic [ref=e1656]: 512 bits (1 blocks)
                  - generic [ref=e1657]:
                    - generic [ref=e1658]: "Message Blocks:"
                    - generic [ref=e1660]: Block 1
                - img [ref=e1662]:
                  - generic [ref=e1664]: Message
                  - generic [ref=e1666]: Padding (pad, 1)
                  - generic [ref=e1667]: 64-bit length suffix
                  - generic [ref=e1669]: Hash Digest
              - generic [ref=e1671]: Output Hash
  - contentinfo [ref=e1673]:
    - paragraph [ref=e1674]: © 2026 Cryptography Museum. Educational tool only.
  - alert [ref=e1675]
```

# Test source

```ts
  71  |   });
  72  | 
  73  |   test('TC-T1-SCYTALE-05 (Varying Width)', async ({ page }) => {
  74  |     await page.fill('[data-testid="input-text-scytale"]', 'SCYTALE');
  75  |     await page.fill('[data-testid="param-width-scytale"]', '3');
  76  |     
  77  |     const encryptBtn = page.locator('[data-testid="encrypt-btn-scytale"]');
  78  |     if (await encryptBtn.count() > 0) {
  79  |       await encryptBtn.click();
  80  |     }
  81  |     const outputText3 = await page.locator('[data-testid="output-text-scytale"]').textContent();
  82  |     
  83  |     await page.fill('[data-testid="param-width-scytale"]', '4');
  84  |     if (await encryptBtn.count() > 0) {
  85  |       await encryptBtn.click();
  86  |     }
  87  |     const outputText4 = await page.locator('[data-testid="output-text-scytale"]').textContent();
  88  |     
  89  |     expect(outputText3).not.toEqual(outputText4);
  90  |   });
  91  | 
  92  |   test('TC-T2-SCYTALE-01 (Width Too Small)', async ({ page }) => {
  93  |     await page.fill('[data-testid="input-text-scytale"]', 'HELLO');
  94  |     await page.fill('[data-testid="param-width-scytale"]', '1');
  95  |     
  96  |     const errorMsg = page.locator('[data-testid="error-message-scytale"]');
  97  |     await expect(errorMsg).toBeVisible();
  98  |   });
  99  | 
  100 |   test('TC-T2-SCYTALE-02 (Non-Numeric Width)', async ({ page }) => {
  101 |     await page.fill('[data-testid="input-text-scytale"]', 'HELLO');
  102 |     await page.fill('[data-testid="param-width-scytale"]', 'xyz');
  103 |     
  104 |     const errorMsg = page.locator('[data-testid="error-message-scytale"]');
  105 |     await expect(errorMsg).toBeVisible();
  106 |   });
  107 | 
  108 |   test('TC-T2-SCYTALE-03 (Width Exceeding Input Length)', async ({ page }) => {
  109 |     await page.fill('[data-testid="input-text-scytale"]', 'HI');
  110 |     await page.fill('[data-testid="param-width-scytale"]', '10');
  111 |     
  112 |     const errorMsg = page.locator('[data-testid="error-message-scytale"]');
  113 |     await expect(errorMsg).not.toBeVisible();
  114 |     await expect(page.locator('[data-testid="output-text-scytale"]')).not.toBeEmpty();
  115 |   });
  116 | 
  117 |   test('TC-T2-SCYTALE-04 (Empty Input Validation)', async ({ page }) => {
  118 |     await page.fill('[data-testid="input-text-scytale"]', '');
  119 |     await page.fill('[data-testid="param-width-scytale"]', '3');
  120 |     
  121 |     const errorMsg = page.locator('[data-testid="error-message-scytale"]');
  122 |     await expect(errorMsg).not.toBeVisible();
  123 |     await expect(page.locator('[data-testid="output-text-scytale"]')).toHaveText('');
  124 |   });
  125 | 
  126 |   test('TC-T2-SCYTALE-05 (Max Length Bound)', async ({ page }) => {
  127 |     const invalidText = 'a'.repeat(501);
  128 |     await page.fill('[data-testid="input-text-scytale"]', invalidText);
  129 |     await page.fill('[data-testid="param-width-scytale"]', '4');
  130 |     
  131 |     const errorMsg = page.locator('[data-testid="error-message-scytale"]');
  132 |     await expect(errorMsg).toBeVisible();
  133 |   });
  134 | 
  135 |   // ==========================================
  136 |   // POLYBIUS CIPHER
  137 |   // ==========================================
  138 | 
  139 |   test('TC-T1-POLYBIUS-01 (Encrypt Standard)', async ({ page }) => {
  140 |     await page.fill('[data-testid="input-text-polybius"]', 'HELLO');
  141 |     
  142 |     const encryptBtn = page.locator('[data-testid="encrypt-btn-polybius"]');
  143 |     if (await encryptBtn.count() > 0) {
  144 |       await encryptBtn.click();
  145 |     } else {
  146 |       const modeSelect = page.locator('[data-testid="mode-select-polybius"]');
  147 |       if (await modeSelect.count() > 0) {
  148 |         await modeSelect.selectOption('encrypt');
  149 |       }
  150 |     }
  151 |     
  152 |     await expect(page.locator('[data-testid="output-text-polybius"]')).toHaveText('23 15 31 31 34');
  153 |   });
  154 | 
  155 |   test('TC-T1-POLYBIUS-02 (Decrypt Standard)', async ({ page }) => {
  156 |     await page.fill('[data-testid="input-text-polybius"]', '23 15 31 31 34');
  157 |     
  158 |     const decryptBtn = page.locator('[data-testid="decrypt-btn-polybius"]');
  159 |     if (await decryptBtn.count() > 0) {
  160 |       await decryptBtn.click();
  161 |     } else {
  162 |       const modeSelect = page.locator('[data-testid="mode-select-polybius"]');
  163 |       if (await modeSelect.count() > 0) {
  164 |         await modeSelect.selectOption('decrypt');
  165 |       }
  166 |     }
  167 |     
  168 |     const outputLocator = page.locator('[data-testid="output-text-polybius"]');
  169 |     await expect(outputLocator).not.toBeEmpty();
  170 |     const outputText = await outputLocator.textContent();
> 171 |     expect(outputText === 'HELLO' || outputText === 'HELLIO').toBe(true);
      |                                                               ^ Error: expect(received).toBe(expected) // Object.is equality
  172 |   });
  173 | 
  174 |   test('TC-T1-POLYBIUS-03 (I and J Merge)', async ({ page }) => {
  175 |     await page.fill('[data-testid="input-text-polybius"]', 'JULIET');
  176 |     
  177 |     const encryptBtn = page.locator('[data-testid="encrypt-btn-polybius"]');
  178 |     if (await encryptBtn.count() > 0) {
  179 |       await encryptBtn.click();
  180 |     }
  181 |     
  182 |     const outputLocator = page.locator('[data-testid="output-text-polybius"]');
  183 |     await expect(outputLocator).not.toBeEmpty();
  184 |     const outputText = await outputLocator.textContent();
  185 |     
  186 |     await page.fill('[data-testid="input-text-polybius"]', 'IULIET');
  187 |     if (await encryptBtn.count() > 0) {
  188 |       await encryptBtn.click();
  189 |     }
  190 |     await expect(page.locator('[data-testid="output-text-polybius"]')).toHaveText(outputText || '');
  191 |   });
  192 | 
  193 |   test('TC-T1-POLYBIUS-04 (Non-Alphabetic Ignored/Preserved)', async ({ page }) => {
  194 |     await page.fill('[data-testid="input-text-polybius"]', 'HE LLO!');
  195 |     
  196 |     const encryptBtn = page.locator('[data-testid="encrypt-btn-polybius"]');
  197 |     if (await encryptBtn.count() > 0) {
  198 |       await encryptBtn.click();
  199 |     }
  200 |     
  201 |     const outputLocator = page.locator('[data-testid="output-text-polybius"]');
  202 |     await expect(outputLocator).not.toBeEmpty();
  203 |     const outputText = await outputLocator.textContent();
  204 |     expect(outputText).not.toBe('');
  205 |   });
  206 | 
  207 |   test('TC-T1-POLYBIUS-05 (Grid Highlight)', async ({ page }) => {
  208 |     await page.fill('[data-testid="input-text-polybius"]', 'A');
  209 |     
  210 |     const visualizer = page.locator('[data-testid="visualizer-polybius"]');
  211 |     await expect(visualizer).toBeVisible();
  212 |     await expect(visualizer.locator('table, svg, div').first()).toBeVisible();
  213 |   });
  214 | 
  215 |   test('TC-T2-POLYBIUS-01 (Invalid Decrypt Coordinates)', async ({ page }) => {
  216 |     await page.fill('[data-testid="input-text-polybius"]', '23 15 31 3');
  217 |     
  218 |     const decryptBtn = page.locator('[data-testid="decrypt-btn-polybius"]');
  219 |     if (await decryptBtn.count() > 0) {
  220 |       await decryptBtn.click();
  221 |     } else {
  222 |       const modeSelect = page.locator('[data-testid="mode-select-polybius"]');
  223 |       if (await modeSelect.count() > 0) {
  224 |         await modeSelect.selectOption('decrypt');
  225 |       }
  226 |     }
  227 |     
  228 |     const errorMsg = page.locator('[data-testid="error-message-polybius"]');
  229 |     await expect(errorMsg).toBeVisible();
  230 |   });
  231 | 
  232 |   test('TC-T2-POLYBIUS-02 (Decryption Out of Range)', async ({ page }) => {
  233 |     await page.fill('[data-testid="input-text-polybius"]', '23 99 31');
  234 |     
  235 |     const decryptBtn = page.locator('[data-testid="decrypt-btn-polybius"]');
  236 |     if (await decryptBtn.count() > 0) {
  237 |       await decryptBtn.click();
  238 |     } else {
  239 |       const modeSelect = page.locator('[data-testid="mode-select-polybius"]');
  240 |       if (await modeSelect.count() > 0) {
  241 |         await modeSelect.selectOption('decrypt');
  242 |       }
  243 |     }
  244 |     
  245 |     const errorMsg = page.locator('[data-testid="error-message-polybius"]');
  246 |     await expect(errorMsg).toBeVisible();
  247 |   });
  248 | 
  249 |   test('TC-T2-POLYBIUS-03 (Empty Input Validation)', async ({ page }) => {
  250 |     await page.fill('[data-testid="input-text-polybius"]', '');
  251 |     
  252 |     const errorMsg = page.locator('[data-testid="error-message-polybius"]');
  253 |     await expect(errorMsg).not.toBeVisible();
  254 |     await expect(page.locator('[data-testid="output-text-polybius"]')).toHaveText('');
  255 |   });
  256 | 
  257 |   test('TC-T2-POLYBIUS-04 (Max Length Bound)', async ({ page }) => {
  258 |     const invalidText = 'a'.repeat(501);
  259 |     await page.fill('[data-testid="input-text-polybius"]', invalidText);
  260 |     
  261 |     const errorMsg = page.locator('[data-testid="error-message-polybius"]');
  262 |     await expect(errorMsg).toBeVisible();
  263 |   });
  264 | 
  265 |   test('TC-T2-POLYBIUS-05 (Non-numeric Coordinates Decrypt)', async ({ page }) => {
  266 |     await page.fill('[data-testid="input-text-polybius"]', '2a 15 31');
  267 |     
  268 |     const decryptBtn = page.locator('[data-testid="decrypt-btn-polybius"]');
  269 |     if (await decryptBtn.count() > 0) {
  270 |       await decryptBtn.click();
  271 |     } else {
```