# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scenarios.spec.ts >> Tier 4: Real-World Application Scenarios E2E Tests >> TC-T4-SCENARIO-01: Multi-Stage Classical Transmission
- Location: tests/e2e/scenarios.spec.ts:8:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "MUSEUM VISIT AT NOON"
Received: "KMVSJMRN OEJTW  QJZP"
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
                  - text: DFOLCFKG HXCMP JCSI
              - generic [ref=e34]:
                - generic [ref=e35]:
                  - generic [ref=e36]: Shift Amount
                  - textbox "Shift Amount" [ref=e37]: "7"
                - generic [ref=e38]:
                  - generic [ref=e39]: Mode Select
                  - combobox "Mode Select" [ref=e40]:
                    - option "Encrypt"
                    - option "Decrypt" [selected]
              - generic [ref=e41]:
                - button "Encrypt Mode" [ref=e42] [cursor=pointer]
                - button "Decrypt Mode" [active] [ref=e43] [cursor=pointer]
              - generic [ref=e44]:
                - generic [ref=e45]: Output Text
                - generic [ref=e46]: WYHEVYDZ AQVFI CVLB
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
                - generic [ref=e79]: T
                - generic [ref=e80]: U
                - generic [ref=e81]: V
                - generic [ref=e82]: W
                - generic [ref=e83]: X
                - generic [ref=e84]: "Y"
                - generic [ref=e85]: Z
                - generic [ref=e86]: A
                - generic [ref=e87]: B
                - generic [ref=e88]: C
                - generic [ref=e89]: D
                - generic [ref=e90]: E
                - generic [ref=e91]: F
                - generic [ref=e92]: G
                - generic [ref=e93]: H
                - generic [ref=e94]: I
                - generic [ref=e95]: J
                - generic [ref=e96]: K
                - generic [ref=e97]: L
                - generic [ref=e98]: M
                - generic [ref=e99]: "N"
                - generic [ref=e100]: O
                - generic [ref=e101]: P
                - generic [ref=e102]: Q
                - generic [ref=e103]: R
                - generic [ref=e104]: S
              - generic [ref=e106]:
                - generic [ref=e107]:
                  - button "Step Backward" [ref=e108] [cursor=pointer]: ⏮
                  - button "Play" [ref=e109] [cursor=pointer]
                  - button "Step Forward" [ref=e110] [cursor=pointer]: ⏭
                  - button "Reset" [ref=e111] [cursor=pointer]: 🔄
                - generic [ref=e112]:
                  - generic [ref=e113]: "Speed:"
                  - slider "Speed:" [ref=e114]: "1000"
                  - generic [ref=e115]: 1000ms
        - generic [ref=e116]:
          - heading "Vigenère Cipher" [level=3] [ref=e117]
          - paragraph [ref=e118]: A polyalphabetic substitution cipher that shifts text letters using a keyword cycled repeatedly.
          - generic [ref=e119]:
            - generic [ref=e120]:
              - generic [ref=e121]:
                - generic [ref=e122]: Input Text (Max 500 Chars)
                - textbox "Input Text (Max 500 Chars)" [ref=e123]:
                  - /placeholder: Enter secret message...
                  - text: LBMUYMSC FGYTX FABE
              - generic [ref=e124]:
                - generic [ref=e125]:
                  - generic [ref=e126]: Keyword
                  - textbox "Keyword" [ref=e127]: SECRET
                - generic [ref=e128]:
                  - generic [ref=e129]: Mode Select
                  - combobox "Mode Select" [ref=e130]:
                    - option "Encrypt"
                    - option "Decrypt" [selected]
              - generic [ref=e131]:
                - button "Encrypt Mode" [ref=e132] [cursor=pointer]
                - button "Decrypt Mode" [ref=e133] [cursor=pointer]
              - generic [ref=e134]:
                - generic [ref=e135]: Output Text
                - generic [ref=e136]: TXKDUTAY DPUAF BYKA
            - generic [ref=e137]:
              - heading "Vigenère Square (Tabula Recta)" [level=4] [ref=e138]
              - table [ref=e140]:
                - rowgroup [ref=e141]:
                  - row "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z" [ref=e142]:
                    - columnheader [ref=e143]
                    - columnheader "A" [ref=e144]
                    - columnheader "B" [ref=e145]
                    - columnheader "C" [ref=e146]
                    - columnheader "D" [ref=e147]
                    - columnheader "E" [ref=e148]
                    - columnheader "F" [ref=e149]
                    - columnheader "G" [ref=e150]
                    - columnheader "H" [ref=e151]
                    - columnheader "I" [ref=e152]
                    - columnheader "J" [ref=e153]
                    - columnheader "K" [ref=e154]
                    - columnheader "L" [ref=e155]
                    - columnheader "M" [ref=e156]
                    - columnheader "N" [ref=e157]
                    - columnheader "O" [ref=e158]
                    - columnheader "P" [ref=e159]
                    - columnheader "Q" [ref=e160]
                    - columnheader "R" [ref=e161]
                    - columnheader "S" [ref=e162]
                    - columnheader "T" [ref=e163]
                    - columnheader "U" [ref=e164]
                    - columnheader "V" [ref=e165]
                    - columnheader "W" [ref=e166]
                    - columnheader "X" [ref=e167]
                    - columnheader "Y" [ref=e168]
                    - columnheader "Z" [ref=e169]
                - rowgroup [ref=e170]:
                  - row "A A B C D E F G H I J K L M N O P Q R S T U V W X Y Z" [ref=e171]:
                    - cell "A" [ref=e172]
                    - cell "A" [ref=e173]
                    - cell "B" [ref=e174]
                    - cell "C" [ref=e175]
                    - cell "D" [ref=e176]
                    - cell "E" [ref=e177]
                    - cell "F" [ref=e178]
                    - cell "G" [ref=e179]
                    - cell "H" [ref=e180]
                    - cell "I" [ref=e181]
                    - cell "J" [ref=e182]
                    - cell "K" [ref=e183]
                    - cell "L" [ref=e184]
                    - cell "M" [ref=e185]
                    - cell "N" [ref=e186]
                    - cell "O" [ref=e187]
                    - cell "P" [ref=e188]
                    - cell "Q" [ref=e189]
                    - cell "R" [ref=e190]
                    - cell "S" [ref=e191]
                    - cell "T" [ref=e192]
                    - cell "U" [ref=e193]
                    - cell "V" [ref=e194]
                    - cell "W" [ref=e195]
                    - cell "X" [ref=e196]
                    - cell "Y" [ref=e197]
                    - cell "Z" [ref=e198]
                  - row "B B C D E F G H I J K L M N O P Q R S T U V W X Y Z A" [ref=e199]:
                    - cell "B" [ref=e200]
                    - cell "B" [ref=e201]
                    - cell "C" [ref=e202]
                    - cell "D" [ref=e203]
                    - cell "E" [ref=e204]
                    - cell "F" [ref=e205]
                    - cell "G" [ref=e206]
                    - cell "H" [ref=e207]
                    - cell "I" [ref=e208]
                    - cell "J" [ref=e209]
                    - cell "K" [ref=e210]
                    - cell "L" [ref=e211]
                    - cell "M" [ref=e212]
                    - cell "N" [ref=e213]
                    - cell "O" [ref=e214]
                    - cell "P" [ref=e215]
                    - cell "Q" [ref=e216]
                    - cell "R" [ref=e217]
                    - cell "S" [ref=e218]
                    - cell "T" [ref=e219]
                    - cell "U" [ref=e220]
                    - cell "V" [ref=e221]
                    - cell "W" [ref=e222]
                    - cell "X" [ref=e223]
                    - cell "Y" [ref=e224]
                    - cell "Z" [ref=e225]
                    - cell "A" [ref=e226]
                  - row "C C D E F G H I J K L M N O P Q R S T U V W X Y Z A B" [ref=e227]:
                    - cell "C" [ref=e228]
                    - cell "C" [ref=e229]
                    - cell "D" [ref=e230]
                    - cell "E" [ref=e231]
                    - cell "F" [ref=e232]
                    - cell "G" [ref=e233]
                    - cell "H" [ref=e234]
                    - cell "I" [ref=e235]
                    - cell "J" [ref=e236]
                    - cell "K" [ref=e237]
                    - cell "L" [ref=e238]
                    - cell "M" [ref=e239]
                    - cell "N" [ref=e240]
                    - cell "O" [ref=e241]
                    - cell "P" [ref=e242]
                    - cell "Q" [ref=e243]
                    - cell "R" [ref=e244]
                    - cell "S" [ref=e245]
                    - cell "T" [ref=e246]
                    - cell "U" [ref=e247]
                    - cell "V" [ref=e248]
                    - cell "W" [ref=e249]
                    - cell "X" [ref=e250]
                    - cell "Y" [ref=e251]
                    - cell "Z" [ref=e252]
                    - cell "A" [ref=e253]
                    - cell "B" [ref=e254]
                  - row "D D E F G H I J K L M N O P Q R S T U V W X Y Z A B C" [ref=e255]:
                    - cell "D" [ref=e256]
                    - cell "D" [ref=e257]
                    - cell "E" [ref=e258]
                    - cell "F" [ref=e259]
                    - cell "G" [ref=e260]
                    - cell "H" [ref=e261]
                    - cell "I" [ref=e262]
                    - cell "J" [ref=e263]
                    - cell "K" [ref=e264]
                    - cell "L" [ref=e265]
                    - cell "M" [ref=e266]
                    - cell "N" [ref=e267]
                    - cell "O" [ref=e268]
                    - cell "P" [ref=e269]
                    - cell "Q" [ref=e270]
                    - cell "R" [ref=e271]
                    - cell "S" [ref=e272]
                    - cell "T" [ref=e273]
                    - cell "U" [ref=e274]
                    - cell "V" [ref=e275]
                    - cell "W" [ref=e276]
                    - cell "X" [ref=e277]
                    - cell "Y" [ref=e278]
                    - cell "Z" [ref=e279]
                    - cell "A" [ref=e280]
                    - cell "B" [ref=e281]
                    - cell "C" [ref=e282]
                  - row "E E F G H I J K L M N O P Q R S T U V W X Y Z A B C D" [ref=e283]:
                    - cell "E" [ref=e284]
                    - cell "E" [ref=e285]
                    - cell "F" [ref=e286]
                    - cell "G" [ref=e287]
                    - cell "H" [ref=e288]
                    - cell "I" [ref=e289]
                    - cell "J" [ref=e290]
                    - cell "K" [ref=e291]
                    - cell "L" [ref=e292]
                    - cell "M" [ref=e293]
                    - cell "N" [ref=e294]
                    - cell "O" [ref=e295]
                    - cell "P" [ref=e296]
                    - cell "Q" [ref=e297]
                    - cell "R" [ref=e298]
                    - cell "S" [ref=e299]
                    - cell "T" [ref=e300]
                    - cell "U" [ref=e301]
                    - cell "V" [ref=e302]
                    - cell "W" [ref=e303]
                    - cell "X" [ref=e304]
                    - cell "Y" [ref=e305]
                    - cell "Z" [ref=e306]
                    - cell "A" [ref=e307]
                    - cell "B" [ref=e308]
                    - cell "C" [ref=e309]
                    - cell "D" [ref=e310]
                  - row "F F G H I J K L M N O P Q R S T U V W X Y Z A B C D E" [ref=e311]:
                    - cell "F" [ref=e312]
                    - cell "F" [ref=e313]
                    - cell "G" [ref=e314]
                    - cell "H" [ref=e315]
                    - cell "I" [ref=e316]
                    - cell "J" [ref=e317]
                    - cell "K" [ref=e318]
                    - cell "L" [ref=e319]
                    - cell "M" [ref=e320]
                    - cell "N" [ref=e321]
                    - cell "O" [ref=e322]
                    - cell "P" [ref=e323]
                    - cell "Q" [ref=e324]
                    - cell "R" [ref=e325]
                    - cell "S" [ref=e326]
                    - cell "T" [ref=e327]
                    - cell "U" [ref=e328]
                    - cell "V" [ref=e329]
                    - cell "W" [ref=e330]
                    - cell "X" [ref=e331]
                    - cell "Y" [ref=e332]
                    - cell "Z" [ref=e333]
                    - cell "A" [ref=e334]
                    - cell "B" [ref=e335]
                    - cell "C" [ref=e336]
                    - cell "D" [ref=e337]
                    - cell "E" [ref=e338]
                  - row "G G H I J K L M N O P Q R S T U V W X Y Z A B C D E F" [ref=e339]:
                    - cell "G" [ref=e340]
                    - cell "G" [ref=e341]
                    - cell "H" [ref=e342]
                    - cell "I" [ref=e343]
                    - cell "J" [ref=e344]
                    - cell "K" [ref=e345]
                    - cell "L" [ref=e346]
                    - cell "M" [ref=e347]
                    - cell "N" [ref=e348]
                    - cell "O" [ref=e349]
                    - cell "P" [ref=e350]
                    - cell "Q" [ref=e351]
                    - cell "R" [ref=e352]
                    - cell "S" [ref=e353]
                    - cell "T" [ref=e354]
                    - cell "U" [ref=e355]
                    - cell "V" [ref=e356]
                    - cell "W" [ref=e357]
                    - cell "X" [ref=e358]
                    - cell "Y" [ref=e359]
                    - cell "Z" [ref=e360]
                    - cell "A" [ref=e361]
                    - cell "B" [ref=e362]
                    - cell "C" [ref=e363]
                    - cell "D" [ref=e364]
                    - cell "E" [ref=e365]
                    - cell "F" [ref=e366]
                  - row "H H I J K L M N O P Q R S T U V W X Y Z A B C D E F G" [ref=e367]:
                    - cell "H" [ref=e368]
                    - cell "H" [ref=e369]
                    - cell "I" [ref=e370]
                    - cell "J" [ref=e371]
                    - cell "K" [ref=e372]
                    - cell "L" [ref=e373]
                    - cell "M" [ref=e374]
                    - cell "N" [ref=e375]
                    - cell "O" [ref=e376]
                    - cell "P" [ref=e377]
                    - cell "Q" [ref=e378]
                    - cell "R" [ref=e379]
                    - cell "S" [ref=e380]
                    - cell "T" [ref=e381]
                    - cell "U" [ref=e382]
                    - cell "V" [ref=e383]
                    - cell "W" [ref=e384]
                    - cell "X" [ref=e385]
                    - cell "Y" [ref=e386]
                    - cell "Z" [ref=e387]
                    - cell "A" [ref=e388]
                    - cell "B" [ref=e389]
                    - cell "C" [ref=e390]
                    - cell "D" [ref=e391]
                    - cell "E" [ref=e392]
                    - cell "F" [ref=e393]
                    - cell "G" [ref=e394]
                  - row "I I J K L M N O P Q R S T U V W X Y Z A B C D E F G H" [ref=e395]:
                    - cell "I" [ref=e396]
                    - cell "I" [ref=e397]
                    - cell "J" [ref=e398]
                    - cell "K" [ref=e399]
                    - cell "L" [ref=e400]
                    - cell "M" [ref=e401]
                    - cell "N" [ref=e402]
                    - cell "O" [ref=e403]
                    - cell "P" [ref=e404]
                    - cell "Q" [ref=e405]
                    - cell "R" [ref=e406]
                    - cell "S" [ref=e407]
                    - cell "T" [ref=e408]
                    - cell "U" [ref=e409]
                    - cell "V" [ref=e410]
                    - cell "W" [ref=e411]
                    - cell "X" [ref=e412]
                    - cell "Y" [ref=e413]
                    - cell "Z" [ref=e414]
                    - cell "A" [ref=e415]
                    - cell "B" [ref=e416]
                    - cell "C" [ref=e417]
                    - cell "D" [ref=e418]
                    - cell "E" [ref=e419]
                    - cell "F" [ref=e420]
                    - cell "G" [ref=e421]
                    - cell "H" [ref=e422]
                  - row "J J K L M N O P Q R S T U V W X Y Z A B C D E F G H I" [ref=e423]:
                    - cell "J" [ref=e424]
                    - cell "J" [ref=e425]
                    - cell "K" [ref=e426]
                    - cell "L" [ref=e427]
                    - cell "M" [ref=e428]
                    - cell "N" [ref=e429]
                    - cell "O" [ref=e430]
                    - cell "P" [ref=e431]
                    - cell "Q" [ref=e432]
                    - cell "R" [ref=e433]
                    - cell "S" [ref=e434]
                    - cell "T" [ref=e435]
                    - cell "U" [ref=e436]
                    - cell "V" [ref=e437]
                    - cell "W" [ref=e438]
                    - cell "X" [ref=e439]
                    - cell "Y" [ref=e440]
                    - cell "Z" [ref=e441]
                    - cell "A" [ref=e442]
                    - cell "B" [ref=e443]
                    - cell "C" [ref=e444]
                    - cell "D" [ref=e445]
                    - cell "E" [ref=e446]
                    - cell "F" [ref=e447]
                    - cell "G" [ref=e448]
                    - cell "H" [ref=e449]
                    - cell "I" [ref=e450]
                  - row "K K L M N O P Q R S T U V W X Y Z A B C D E F G H I J" [ref=e451]:
                    - cell "K" [ref=e452]
                    - cell "K" [ref=e453]
                    - cell "L" [ref=e454]
                    - cell "M" [ref=e455]
                    - cell "N" [ref=e456]
                    - cell "O" [ref=e457]
                    - cell "P" [ref=e458]
                    - cell "Q" [ref=e459]
                    - cell "R" [ref=e460]
                    - cell "S" [ref=e461]
                    - cell "T" [ref=e462]
                    - cell "U" [ref=e463]
                    - cell "V" [ref=e464]
                    - cell "W" [ref=e465]
                    - cell "X" [ref=e466]
                    - cell "Y" [ref=e467]
                    - cell "Z" [ref=e468]
                    - cell "A" [ref=e469]
                    - cell "B" [ref=e470]
                    - cell "C" [ref=e471]
                    - cell "D" [ref=e472]
                    - cell "E" [ref=e473]
                    - cell "F" [ref=e474]
                    - cell "G" [ref=e475]
                    - cell "H" [ref=e476]
                    - cell "I" [ref=e477]
                    - cell "J" [ref=e478]
                  - row "L L M N O P Q R S T U V W X Y Z A B C D E F G H I J K" [ref=e479]:
                    - cell "L" [ref=e480]
                    - cell "L" [ref=e481]
                    - cell "M" [ref=e482]
                    - cell "N" [ref=e483]
                    - cell "O" [ref=e484]
                    - cell "P" [ref=e485]
                    - cell "Q" [ref=e486]
                    - cell "R" [ref=e487]
                    - cell "S" [ref=e488]
                    - cell "T" [ref=e489]
                    - cell "U" [ref=e490]
                    - cell "V" [ref=e491]
                    - cell "W" [ref=e492]
                    - cell "X" [ref=e493]
                    - cell "Y" [ref=e494]
                    - cell "Z" [ref=e495]
                    - cell "A" [ref=e496]
                    - cell "B" [ref=e497]
                    - cell "C" [ref=e498]
                    - cell "D" [ref=e499]
                    - cell "E" [ref=e500]
                    - cell "F" [ref=e501]
                    - cell "G" [ref=e502]
                    - cell "H" [ref=e503]
                    - cell "I" [ref=e504]
                    - cell "J" [ref=e505]
                    - cell "K" [ref=e506]
                  - row "M M N O P Q R S T U V W X Y Z A B C D E F G H I J K L" [ref=e507]:
                    - cell "M" [ref=e508]
                    - cell "M" [ref=e509]
                    - cell "N" [ref=e510]
                    - cell "O" [ref=e511]
                    - cell "P" [ref=e512]
                    - cell "Q" [ref=e513]
                    - cell "R" [ref=e514]
                    - cell "S" [ref=e515]
                    - cell "T" [ref=e516]
                    - cell "U" [ref=e517]
                    - cell "V" [ref=e518]
                    - cell "W" [ref=e519]
                    - cell "X" [ref=e520]
                    - cell "Y" [ref=e521]
                    - cell "Z" [ref=e522]
                    - cell "A" [ref=e523]
                    - cell "B" [ref=e524]
                    - cell "C" [ref=e525]
                    - cell "D" [ref=e526]
                    - cell "E" [ref=e527]
                    - cell "F" [ref=e528]
                    - cell "G" [ref=e529]
                    - cell "H" [ref=e530]
                    - cell "I" [ref=e531]
                    - cell "J" [ref=e532]
                    - cell "K" [ref=e533]
                    - cell "L" [ref=e534]
                  - row "N N O P Q R S T U V W X Y Z A B C D E F G H I J K L M" [ref=e535]:
                    - cell "N" [ref=e536]
                    - cell "N" [ref=e537]
                    - cell "O" [ref=e538]
                    - cell "P" [ref=e539]
                    - cell "Q" [ref=e540]
                    - cell "R" [ref=e541]
                    - cell "S" [ref=e542]
                    - cell "T" [ref=e543]
                    - cell "U" [ref=e544]
                    - cell "V" [ref=e545]
                    - cell "W" [ref=e546]
                    - cell "X" [ref=e547]
                    - cell "Y" [ref=e548]
                    - cell "Z" [ref=e549]
                    - cell "A" [ref=e550]
                    - cell "B" [ref=e551]
                    - cell "C" [ref=e552]
                    - cell "D" [ref=e553]
                    - cell "E" [ref=e554]
                    - cell "F" [ref=e555]
                    - cell "G" [ref=e556]
                    - cell "H" [ref=e557]
                    - cell "I" [ref=e558]
                    - cell "J" [ref=e559]
                    - cell "K" [ref=e560]
                    - cell "L" [ref=e561]
                    - cell "M" [ref=e562]
                  - row "O O P Q R S T U V W X Y Z A B C D E F G H I J K L M N" [ref=e563]:
                    - cell "O" [ref=e564]
                    - cell "O" [ref=e565]
                    - cell "P" [ref=e566]
                    - cell "Q" [ref=e567]
                    - cell "R" [ref=e568]
                    - cell "S" [ref=e569]
                    - cell "T" [ref=e570]
                    - cell "U" [ref=e571]
                    - cell "V" [ref=e572]
                    - cell "W" [ref=e573]
                    - cell "X" [ref=e574]
                    - cell "Y" [ref=e575]
                    - cell "Z" [ref=e576]
                    - cell "A" [ref=e577]
                    - cell "B" [ref=e578]
                    - cell "C" [ref=e579]
                    - cell "D" [ref=e580]
                    - cell "E" [ref=e581]
                    - cell "F" [ref=e582]
                    - cell "G" [ref=e583]
                    - cell "H" [ref=e584]
                    - cell "I" [ref=e585]
                    - cell "J" [ref=e586]
                    - cell "K" [ref=e587]
                    - cell "L" [ref=e588]
                    - cell "M" [ref=e589]
                    - cell "N" [ref=e590]
                  - row "P P Q R S T U V W X Y Z A B C D E F G H I J K L M N O" [ref=e591]:
                    - cell "P" [ref=e592]
                    - cell "P" [ref=e593]
                    - cell "Q" [ref=e594]
                    - cell "R" [ref=e595]
                    - cell "S" [ref=e596]
                    - cell "T" [ref=e597]
                    - cell "U" [ref=e598]
                    - cell "V" [ref=e599]
                    - cell "W" [ref=e600]
                    - cell "X" [ref=e601]
                    - cell "Y" [ref=e602]
                    - cell "Z" [ref=e603]
                    - cell "A" [ref=e604]
                    - cell "B" [ref=e605]
                    - cell "C" [ref=e606]
                    - cell "D" [ref=e607]
                    - cell "E" [ref=e608]
                    - cell "F" [ref=e609]
                    - cell "G" [ref=e610]
                    - cell "H" [ref=e611]
                    - cell "I" [ref=e612]
                    - cell "J" [ref=e613]
                    - cell "K" [ref=e614]
                    - cell "L" [ref=e615]
                    - cell "M" [ref=e616]
                    - cell "N" [ref=e617]
                    - cell "O" [ref=e618]
                  - row "Q Q R S T U V W X Y Z A B C D E F G H I J K L M N O P" [ref=e619]:
                    - cell "Q" [ref=e620]
                    - cell "Q" [ref=e621]
                    - cell "R" [ref=e622]
                    - cell "S" [ref=e623]
                    - cell "T" [ref=e624]
                    - cell "U" [ref=e625]
                    - cell "V" [ref=e626]
                    - cell "W" [ref=e627]
                    - cell "X" [ref=e628]
                    - cell "Y" [ref=e629]
                    - cell "Z" [ref=e630]
                    - cell "A" [ref=e631]
                    - cell "B" [ref=e632]
                    - cell "C" [ref=e633]
                    - cell "D" [ref=e634]
                    - cell "E" [ref=e635]
                    - cell "F" [ref=e636]
                    - cell "G" [ref=e637]
                    - cell "H" [ref=e638]
                    - cell "I" [ref=e639]
                    - cell "J" [ref=e640]
                    - cell "K" [ref=e641]
                    - cell "L" [ref=e642]
                    - cell "M" [ref=e643]
                    - cell "N" [ref=e644]
                    - cell "O" [ref=e645]
                    - cell "P" [ref=e646]
                  - row "R R S T U V W X Y Z A B C D E F G H I J K L M N O P Q" [ref=e647]:
                    - cell "R" [ref=e648]
                    - cell "R" [ref=e649]
                    - cell "S" [ref=e650]
                    - cell "T" [ref=e651]
                    - cell "U" [ref=e652]
                    - cell "V" [ref=e653]
                    - cell "W" [ref=e654]
                    - cell "X" [ref=e655]
                    - cell "Y" [ref=e656]
                    - cell "Z" [ref=e657]
                    - cell "A" [ref=e658]
                    - cell "B" [ref=e659]
                    - cell "C" [ref=e660]
                    - cell "D" [ref=e661]
                    - cell "E" [ref=e662]
                    - cell "F" [ref=e663]
                    - cell "G" [ref=e664]
                    - cell "H" [ref=e665]
                    - cell "I" [ref=e666]
                    - cell "J" [ref=e667]
                    - cell "K" [ref=e668]
                    - cell "L" [ref=e669]
                    - cell "M" [ref=e670]
                    - cell "N" [ref=e671]
                    - cell "O" [ref=e672]
                    - cell "P" [ref=e673]
                    - cell "Q" [ref=e674]
                  - row "S S T U V W X Y Z A B C D E F G H I J K L M N O P Q R" [ref=e675]:
                    - cell "S" [ref=e676]
                    - cell "S" [ref=e677]
                    - cell "T" [ref=e678]
                    - cell "U" [ref=e679]
                    - cell "V" [ref=e680]
                    - cell "W" [ref=e681]
                    - cell "X" [ref=e682]
                    - cell "Y" [ref=e683]
                    - cell "Z" [ref=e684]
                    - cell "A" [ref=e685]
                    - cell "B" [ref=e686]
                    - cell "C" [ref=e687]
                    - cell "D" [ref=e688]
                    - cell "E" [ref=e689]
                    - cell "F" [ref=e690]
                    - cell "G" [ref=e691]
                    - cell "H" [ref=e692]
                    - cell "I" [ref=e693]
                    - cell "J" [ref=e694]
                    - cell "K" [ref=e695]
                    - cell "L" [ref=e696]
                    - cell "M" [ref=e697]
                    - cell "N" [ref=e698]
                    - cell "O" [ref=e699]
                    - cell "P" [ref=e700]
                    - cell "Q" [ref=e701]
                    - cell "R" [ref=e702]
                  - row "T T U V W X Y Z A B C D E F G H I J K L M N O P Q R S" [ref=e703]:
                    - cell "T" [ref=e704]
                    - cell "T" [ref=e705]
                    - cell "U" [ref=e706]
                    - cell "V" [ref=e707]
                    - cell "W" [ref=e708]
                    - cell "X" [ref=e709]
                    - cell "Y" [ref=e710]
                    - cell "Z" [ref=e711]
                    - cell "A" [ref=e712]
                    - cell "B" [ref=e713]
                    - cell "C" [ref=e714]
                    - cell "D" [ref=e715]
                    - cell "E" [ref=e716]
                    - cell "F" [ref=e717]
                    - cell "G" [ref=e718]
                    - cell "H" [ref=e719]
                    - cell "I" [ref=e720]
                    - cell "J" [ref=e721]
                    - cell "K" [ref=e722]
                    - cell "L" [ref=e723]
                    - cell "M" [ref=e724]
                    - cell "N" [ref=e725]
                    - cell "O" [ref=e726]
                    - cell "P" [ref=e727]
                    - cell "Q" [ref=e728]
                    - cell "R" [ref=e729]
                    - cell "S" [ref=e730]
                  - row "U U V W X Y Z A B C D E F G H I J K L M N O P Q R S T" [ref=e731]:
                    - cell "U" [ref=e732]
                    - cell "U" [ref=e733]
                    - cell "V" [ref=e734]
                    - cell "W" [ref=e735]
                    - cell "X" [ref=e736]
                    - cell "Y" [ref=e737]
                    - cell "Z" [ref=e738]
                    - cell "A" [ref=e739]
                    - cell "B" [ref=e740]
                    - cell "C" [ref=e741]
                    - cell "D" [ref=e742]
                    - cell "E" [ref=e743]
                    - cell "F" [ref=e744]
                    - cell "G" [ref=e745]
                    - cell "H" [ref=e746]
                    - cell "I" [ref=e747]
                    - cell "J" [ref=e748]
                    - cell "K" [ref=e749]
                    - cell "L" [ref=e750]
                    - cell "M" [ref=e751]
                    - cell "N" [ref=e752]
                    - cell "O" [ref=e753]
                    - cell "P" [ref=e754]
                    - cell "Q" [ref=e755]
                    - cell "R" [ref=e756]
                    - cell "S" [ref=e757]
                    - cell "T" [ref=e758]
                  - row "V V W X Y Z A B C D E F G H I J K L M N O P Q R S T U" [ref=e759]:
                    - cell "V" [ref=e760]
                    - cell "V" [ref=e761]
                    - cell "W" [ref=e762]
                    - cell "X" [ref=e763]
                    - cell "Y" [ref=e764]
                    - cell "Z" [ref=e765]
                    - cell "A" [ref=e766]
                    - cell "B" [ref=e767]
                    - cell "C" [ref=e768]
                    - cell "D" [ref=e769]
                    - cell "E" [ref=e770]
                    - cell "F" [ref=e771]
                    - cell "G" [ref=e772]
                    - cell "H" [ref=e773]
                    - cell "I" [ref=e774]
                    - cell "J" [ref=e775]
                    - cell "K" [ref=e776]
                    - cell "L" [ref=e777]
                    - cell "M" [ref=e778]
                    - cell "N" [ref=e779]
                    - cell "O" [ref=e780]
                    - cell "P" [ref=e781]
                    - cell "Q" [ref=e782]
                    - cell "R" [ref=e783]
                    - cell "S" [ref=e784]
                    - cell "T" [ref=e785]
                    - cell "U" [ref=e786]
                  - row "W W X Y Z A B C D E F G H I J K L M N O P Q R S T U V" [ref=e787]:
                    - cell "W" [ref=e788]
                    - cell "W" [ref=e789]
                    - cell "X" [ref=e790]
                    - cell "Y" [ref=e791]
                    - cell "Z" [ref=e792]
                    - cell "A" [ref=e793]
                    - cell "B" [ref=e794]
                    - cell "C" [ref=e795]
                    - cell "D" [ref=e796]
                    - cell "E" [ref=e797]
                    - cell "F" [ref=e798]
                    - cell "G" [ref=e799]
                    - cell "H" [ref=e800]
                    - cell "I" [ref=e801]
                    - cell "J" [ref=e802]
                    - cell "K" [ref=e803]
                    - cell "L" [ref=e804]
                    - cell "M" [ref=e805]
                    - cell "N" [ref=e806]
                    - cell "O" [ref=e807]
                    - cell "P" [ref=e808]
                    - cell "Q" [ref=e809]
                    - cell "R" [ref=e810]
                    - cell "S" [ref=e811]
                    - cell "T" [ref=e812]
                    - cell "U" [ref=e813]
                    - cell "V" [ref=e814]
                  - row "X X Y Z A B C D E F G H I J K L M N O P Q R S T U V W" [ref=e815]:
                    - cell "X" [ref=e816]
                    - cell "X" [ref=e817]
                    - cell "Y" [ref=e818]
                    - cell "Z" [ref=e819]
                    - cell "A" [ref=e820]
                    - cell "B" [ref=e821]
                    - cell "C" [ref=e822]
                    - cell "D" [ref=e823]
                    - cell "E" [ref=e824]
                    - cell "F" [ref=e825]
                    - cell "G" [ref=e826]
                    - cell "H" [ref=e827]
                    - cell "I" [ref=e828]
                    - cell "J" [ref=e829]
                    - cell "K" [ref=e830]
                    - cell "L" [ref=e831]
                    - cell "M" [ref=e832]
                    - cell "N" [ref=e833]
                    - cell "O" [ref=e834]
                    - cell "P" [ref=e835]
                    - cell "Q" [ref=e836]
                    - cell "R" [ref=e837]
                    - cell "S" [ref=e838]
                    - cell "T" [ref=e839]
                    - cell "U" [ref=e840]
                    - cell "V" [ref=e841]
                    - cell "W" [ref=e842]
                  - row "Y Y Z A B C D E F G H I J K L M N O P Q R S T U V W X" [ref=e843]:
                    - cell "Y" [ref=e844]
                    - cell "Y" [ref=e845]
                    - cell "Z" [ref=e846]
                    - cell "A" [ref=e847]
                    - cell "B" [ref=e848]
                    - cell "C" [ref=e849]
                    - cell "D" [ref=e850]
                    - cell "E" [ref=e851]
                    - cell "F" [ref=e852]
                    - cell "G" [ref=e853]
                    - cell "H" [ref=e854]
                    - cell "I" [ref=e855]
                    - cell "J" [ref=e856]
                    - cell "K" [ref=e857]
                    - cell "L" [ref=e858]
                    - cell "M" [ref=e859]
                    - cell "N" [ref=e860]
                    - cell "O" [ref=e861]
                    - cell "P" [ref=e862]
                    - cell "Q" [ref=e863]
                    - cell "R" [ref=e864]
                    - cell "S" [ref=e865]
                    - cell "T" [ref=e866]
                    - cell "U" [ref=e867]
                    - cell "V" [ref=e868]
                    - cell "W" [ref=e869]
                    - cell "X" [ref=e870]
                  - row "Z Z A B C D E F G H I J K L M N O P Q R S T U V W X Y" [ref=e871]:
                    - cell "Z" [ref=e872]
                    - cell "Z" [ref=e873]
                    - cell "A" [ref=e874]
                    - cell "B" [ref=e875]
                    - cell "C" [ref=e876]
                    - cell "D" [ref=e877]
                    - cell "E" [ref=e878]
                    - cell "F" [ref=e879]
                    - cell "G" [ref=e880]
                    - cell "H" [ref=e881]
                    - cell "I" [ref=e882]
                    - cell "J" [ref=e883]
                    - cell "K" [ref=e884]
                    - cell "L" [ref=e885]
                    - cell "M" [ref=e886]
                    - cell "N" [ref=e887]
                    - cell "O" [ref=e888]
                    - cell "P" [ref=e889]
                    - cell "Q" [ref=e890]
                    - cell "R" [ref=e891]
                    - cell "S" [ref=e892]
                    - cell "T" [ref=e893]
                    - cell "U" [ref=e894]
                    - cell "V" [ref=e895]
                    - cell "W" [ref=e896]
                    - cell "X" [ref=e897]
                    - cell "Y" [ref=e898]
              - generic [ref=e899]:
                - generic [ref=e900]:
                  - button "Step Backward" [ref=e901] [cursor=pointer]: ⏮
                  - button "Play" [ref=e902] [cursor=pointer]
                  - button "Step Forward" [ref=e903] [cursor=pointer]: ⏭
                  - button "Reset" [ref=e904] [cursor=pointer]: 🔄
                - generic [ref=e905]:
                  - generic [ref=e906]: "Speed:"
                  - slider "Speed:" [ref=e907]: "1000"
                  - generic [ref=e908]: 1000ms
        - generic [ref=e909]:
          - heading "Affine Cipher" [level=3] [ref=e910]
          - paragraph [ref=e911]: "A mathematical substitution cipher where each letter is mapped to its numeric equivalent, encrypted via the formula: E(x) = (ax + b) mod 26."
          - generic [ref=e912]:
            - generic [ref=e913]:
              - generic [ref=e914]:
                - generic [ref=e915]: Input Text (Max 500 Chars)
                - textbox "Input Text (Max 500 Chars)" [ref=e916]:
                  - /placeholder: Enter secret message...
              - generic [ref=e917]:
                - generic [ref=e918]:
                  - generic [ref=e919]: Key a
                  - textbox "Key a" [ref=e920]: "5"
                - generic [ref=e921]:
                  - generic [ref=e922]: Key b
                  - textbox "Key b" [ref=e923]: "8"
                - generic [ref=e924]:
                  - generic [ref=e925]: Mode Select
                  - combobox "Mode Select" [ref=e926]:
                    - option "Encrypt" [selected]
                    - option "Decrypt"
              - generic [ref=e927]:
                - button "Encrypt Mode" [ref=e928] [cursor=pointer]
                - button "Decrypt Mode" [ref=e929] [cursor=pointer]
              - generic [ref=e931]: Output Text
            - generic [ref=e933]:
              - heading "Mathematical Formula Visualizer" [level=4] [ref=e934]
              - generic [ref=e936]:
                - text: E(x) = (5x + 8) mod 26
                - generic [ref=e937]: E(0) = (5 × 0 + 8) mod 26 = 8
              - img [ref=e939]:
                - generic [ref=e940]:
                  - generic [ref=e942]: A
                  - generic [ref=e944]: a
                - generic [ref=e946]:
                  - generic [ref=e948]: B
                  - generic [ref=e950]: b
                - generic [ref=e951]:
                  - generic [ref=e953]: C
                  - generic [ref=e955]: c
                - generic [ref=e956]:
                  - generic [ref=e958]: D
                  - generic [ref=e960]: d
                - generic [ref=e961]:
                  - generic [ref=e963]: E
                  - generic [ref=e965]: e
                - generic [ref=e966]:
                  - generic [ref=e968]: F
                  - generic [ref=e970]: f
                - generic [ref=e971]:
                  - generic [ref=e973]: G
                  - generic [ref=e975]: g
                - generic [ref=e976]:
                  - generic [ref=e978]: H
                  - generic [ref=e980]: h
                - generic [ref=e981]:
                  - generic [ref=e983]: I
                  - generic [ref=e985]: i
                - generic [ref=e986]:
                  - generic [ref=e988]: J
                  - generic [ref=e990]: j
                - generic [ref=e991]:
                  - generic [ref=e993]: K
                  - generic [ref=e995]: k
                - generic [ref=e996]:
                  - generic [ref=e998]: L
                  - generic [ref=e1000]: l
                - generic [ref=e1001]:
                  - generic [ref=e1003]: M
                  - generic [ref=e1005]: m
                - generic [ref=e1006]:
                  - generic [ref=e1008]: "N"
                  - generic [ref=e1010]: "n"
                - generic [ref=e1011]:
                  - generic [ref=e1013]: O
                  - generic [ref=e1015]: o
                - generic [ref=e1016]:
                  - generic [ref=e1018]: P
                  - generic [ref=e1020]: p
                - generic [ref=e1021]:
                  - generic [ref=e1023]: Q
                  - generic [ref=e1025]: q
                - generic [ref=e1026]:
                  - generic [ref=e1028]: R
                  - generic [ref=e1030]: r
                - generic [ref=e1031]:
                  - generic [ref=e1033]: S
                  - generic [ref=e1035]: s
                - generic [ref=e1036]:
                  - generic [ref=e1038]: T
                  - generic [ref=e1040]: t
                - generic [ref=e1041]:
                  - generic [ref=e1043]: U
                  - generic [ref=e1045]: u
                - generic [ref=e1046]:
                  - generic [ref=e1048]: V
                  - generic [ref=e1050]: v
                - generic [ref=e1051]:
                  - generic [ref=e1053]: W
                  - generic [ref=e1055]: w
                - generic [ref=e1056]:
                  - generic [ref=e1058]: X
                  - generic [ref=e1060]: x
                - generic [ref=e1061]:
                  - generic [ref=e1063]: "Y"
                  - generic [ref=e1065]: "y"
                - generic [ref=e1066]:
                  - generic [ref=e1068]: Z
                  - generic [ref=e1070]: z
              - generic [ref=e1071]:
                - generic [ref=e1072]:
                  - button "Step Backward" [ref=e1073] [cursor=pointer]: ⏮
                  - button "Play" [ref=e1074] [cursor=pointer]
                  - button "Step Forward" [ref=e1075] [cursor=pointer]: ⏭
                  - button "Reset" [ref=e1076] [cursor=pointer]: 🔄
                - generic [ref=e1077]:
                  - generic [ref=e1078]: "Speed:"
                  - slider "Speed:" [ref=e1079]: "1000"
                  - generic [ref=e1080]: 1000ms
        - generic [ref=e1081]:
          - heading "Scytale Cipher" [level=3] [ref=e1082]
          - paragraph [ref=e1083]: A transposition cipher used by the ancient Greeks, consisting of a cylinder with a strip of parchment wrapped around it.
          - generic [ref=e1084]:
            - generic [ref=e1085]:
              - generic [ref=e1086]:
                - generic [ref=e1087]: Input Text (Max 500 Chars)
                - textbox "Input Text (Max 500 Chars)" [ref=e1088]:
                  - /placeholder: Enter secret message...
                  - text: LC B MFFUGAYYBMTESX
              - generic [ref=e1089]:
                - generic [ref=e1090]:
                  - generic [ref=e1091]: Cylinder Width (Diameter)
                  - textbox "Cylinder Width (Diameter)" [ref=e1092]: "3"
                - generic [ref=e1093]:
                  - generic [ref=e1094]: Action
                  - generic [ref=e1095]:
                    - button "Encrypt" [ref=e1096] [cursor=pointer]
                    - button "Decrypt" [ref=e1097] [cursor=pointer]
              - generic [ref=e1098]:
                - generic [ref=e1099]:
                  - generic [ref=e1100]: "Step: 1 / 21"
                  - generic [ref=e1101]:
                    - button "Step Backward" [disabled] [ref=e1102]: ⏮️
                    - button "Play" [ref=e1103] [cursor=pointer]: ▶️
                    - button "Step Forward" [ref=e1104] [cursor=pointer]: ⏭️
                    - button "Reset" [ref=e1105] [cursor=pointer]: 🔄
                - generic [ref=e1106]:
                  - generic [ref=e1107]: Speed
                  - slider "Speed" [ref=e1108] [cursor=pointer]: "1000"
                  - generic [ref=e1109]: 1000ms
            - generic [ref=e1110]:
              - img [ref=e1112]:
                - generic [ref=e1123]: L
                - generic [ref=e1125]: C
                - generic [ref=e1127]: _
                - generic [ref=e1129]: B
                - generic [ref=e1131]: _
                - generic [ref=e1133]: _
                - generic [ref=e1135]: M
                - generic [ref=e1137]: F
                - generic [ref=e1139]: F
                - generic [ref=e1141]: U
                - generic [ref=e1143]: G
                - generic [ref=e1145]: A
                - generic [ref=e1147]: "Y"
                - generic [ref=e1149]: "Y"
                - generic [ref=e1151]: B
                - generic [ref=e1153]: M
                - generic [ref=e1155]: T
                - generic [ref=e1157]: E
                - generic [ref=e1159]: S
                - generic [ref=e1161]: X
                - generic [ref=e1163]: _
              - generic [ref=e1164]:
                - generic [ref=e1165]: Output Text
                - generic [ref=e1166]: LFBCFM UTBGE AS YXMY
        - generic [ref=e1167]:
          - heading "Polybius Square" [level=3] [ref=e1168]
          - paragraph [ref=e1169]: A device invented by the ancient Greeks for fractionating letters into grid coordinates (1-5 for rows and columns).
          - generic [ref=e1170]:
            - generic [ref=e1171]:
              - generic [ref=e1172]:
                - generic [ref=e1173]: Input Text (Max 500 Chars)
                - textbox "Input Text (Max 500 Chars)" [ref=e1174]:
                  - /placeholder: Enter message (letters for encrypt, coordinate pairs for decrypt)...
              - generic [ref=e1175]:
                - generic [ref=e1176]:
                  - generic [ref=e1177]: Grid Key (25 letters)
                  - textbox "Grid Key (25 letters)" [ref=e1178]: abcdefghiklmnopqrstuvwxyz
                - generic [ref=e1179]:
                  - generic [ref=e1180]: Action
                  - generic [ref=e1181]:
                    - button "Encrypt" [ref=e1182] [cursor=pointer]
                    - button "Decrypt" [ref=e1183] [cursor=pointer]
              - generic [ref=e1184]:
                - generic [ref=e1185]:
                  - generic [ref=e1186]: "Step: 1 / 1"
                  - generic [ref=e1187]:
                    - button "Step Backward" [disabled] [ref=e1188]: ⏮️
                    - button "Play" [ref=e1189] [cursor=pointer]: ▶️
                    - button "Step Forward" [disabled] [ref=e1190]: ⏭️
                    - button "Reset" [ref=e1191] [cursor=pointer]: 🔄
                - generic [ref=e1192]:
                  - generic [ref=e1193]: Speed
                  - slider "Speed" [ref=e1194] [cursor=pointer]: "1000"
                  - generic [ref=e1195]: 1000ms
            - generic [ref=e1196]:
              - table [ref=e1198]:
                - rowgroup [ref=e1199]:
                  - row "1 2 3 4 5" [ref=e1200]:
                    - columnheader [ref=e1201]
                    - columnheader "1" [ref=e1202]
                    - columnheader "2" [ref=e1203]
                    - columnheader "3" [ref=e1204]
                    - columnheader "4" [ref=e1205]
                    - columnheader "5" [ref=e1206]
                - rowgroup [ref=e1207]:
                  - row "1 A B C D E" [ref=e1208]:
                    - rowheader "1" [ref=e1209]
                    - cell "A" [ref=e1210]
                    - cell "B" [ref=e1211]
                    - cell "C" [ref=e1212]
                    - cell "D" [ref=e1213]
                    - cell "E" [ref=e1214]
                  - row "2 F G H I K" [ref=e1215]:
                    - rowheader "2" [ref=e1216]
                    - cell "F" [ref=e1217]
                    - cell "G" [ref=e1218]
                    - cell "H" [ref=e1219]
                    - cell "I" [ref=e1220]
                    - cell "K" [ref=e1221]
                  - row "3 L M N O P" [ref=e1222]:
                    - rowheader "3" [ref=e1223]
                    - cell "L" [ref=e1224]
                    - cell "M" [ref=e1225]
                    - cell "N" [ref=e1226]
                    - cell "O" [ref=e1227]
                    - cell "P" [ref=e1228]
                  - row "4 Q R S T U" [ref=e1229]:
                    - rowheader "4" [ref=e1230]
                    - cell "Q" [ref=e1231]
                    - cell "R" [ref=e1232]
                    - cell "S" [ref=e1233]
                    - cell "T" [ref=e1234]
                    - cell "U" [ref=e1235]
                  - row "5 V W X Y Z" [ref=e1236]:
                    - rowheader "5" [ref=e1237]
                    - cell "V" [ref=e1238]
                    - cell "W" [ref=e1239]
                    - cell "X" [ref=e1240]
                    - cell "Y" [ref=e1241]
                    - cell "Z" [ref=e1242]
              - generic [ref=e1244]: Output Text
        - generic [ref=e1246]:
          - heading "Enigma Machine" [level=3] [ref=e1247]
          - paragraph [ref=e1248]: The legendary electro-mechanical rotor cipher machine used in WWII, featuring configurable rotors, ring settings, and plugboard connections.
          - generic [ref=e1249]:
            - generic [ref=e1250]:
              - generic [ref=e1251]:
                - generic [ref=e1252]: Input Text (Max 500 Chars)
                - textbox "Input Text (Max 500 Chars)" [ref=e1253]:
                  - /placeholder: Enter message to encipher (A-Z only)...
              - generic [ref=e1254]:
                - generic [ref=e1255]:
                  - generic [ref=e1256]: Rotors (e.g. I-II-III)
                  - textbox "Rotors (e.g. I-II-III)" [ref=e1257]: I-II-III
                - generic [ref=e1258]:
                  - generic [ref=e1259]: Initial Positions (e.g. A-A-A)
                  - textbox "Initial Positions (e.g. A-A-A)" [ref=e1260]: A-A-A
              - generic [ref=e1261]:
                - generic [ref=e1262]:
                  - generic [ref=e1263]: Ring Settings (e.g. A-A-A or 1-1-1)
                  - textbox "Ring Settings (e.g. A-A-A or 1-1-1)" [ref=e1264]: A-A-A
                - generic [ref=e1265]:
                  - generic [ref=e1266]: Plugboard Swaps (e.g. AB CD)
                  - textbox "Plugboard Swaps (e.g. AB CD)" [ref=e1267]
              - button "Encipher Message" [ref=e1268] [cursor=pointer]
              - generic [ref=e1269]:
                - generic [ref=e1270]:
                  - generic [ref=e1271]: "Step: 1 / 1"
                  - generic [ref=e1272]:
                    - button "Step Backward" [disabled] [ref=e1273]: ⏮️
                    - button "Play" [ref=e1274] [cursor=pointer]: ▶️
                    - button "Step Forward" [disabled] [ref=e1275]: ⏭️
                    - button "Reset" [ref=e1276] [cursor=pointer]: 🔄
                - generic [ref=e1277]:
                  - generic [ref=e1278]: Speed
                  - slider "Speed" [ref=e1279] [cursor=pointer]: "1000"
                  - generic [ref=e1280]: 1000ms
            - generic [ref=e1281]:
              - img [ref=e1283]:
                - generic [ref=e1284]: REFL
                - generic [ref=e1285]: ROTOR 1 (A)
                - generic [ref=e1286]: ROTOR 2 (A)
                - generic [ref=e1287]: ROTOR 3 (A)
                - generic [ref=e1288]: PLUG/KB
              - generic [ref=e1524]: Output Text
        - generic [ref=e1526]:
          - generic [ref=e1527]:
            - generic [ref=e1528]:
              - heading "AES Cipher" [level=3] [ref=e1529]
              - paragraph [ref=e1530]: Advanced Encryption Standard (AES-256 CTR Mode)
            - combobox [ref=e1532]:
              - option "Encrypt Mode" [selected]
              - option "Decrypt Mode"
          - generic [ref=e1533]:
            - generic [ref=e1534]:
              - generic [ref=e1535]:
                - generic [ref=e1536]: Input String
                - textbox "Input String" [ref=e1537]:
                  - /placeholder: Enter text or hex to encrypt/decrypt...
              - generic [ref=e1538]:
                - generic [ref=e1539]:
                  - generic [ref=e1540]: Input Format
                  - combobox "Input Format" [ref=e1541]:
                    - option "Plain Text" [selected]
                    - option "Hexadecimal"
                - generic [ref=e1542]:
                  - generic [ref=e1543]: Key Format
                  - combobox "Key Format" [ref=e1544]:
                    - option "Plain Text" [selected]
                    - option "Hexadecimal"
              - generic [ref=e1545]:
                - generic [ref=e1546]: Cipher Key (16 or 32 bytes)
                - textbox "Cipher Key (16 or 32 bytes)" [ref=e1547]: "1234567890123456"
              - generic [ref=e1548]:
                - button "Encrypt" [ref=e1549] [cursor=pointer]
                - button "Decrypt" [ref=e1550] [cursor=pointer]
              - generic [ref=e1551]:
                - generic [ref=e1552]:
                  - generic [ref=e1553]: "Round: 0 / 10"
                  - generic [ref=e1554]:
                    - button "Step Backward" [disabled] [ref=e1555]: ⏮️
                    - button "Play" [ref=e1556] [cursor=pointer]: ▶️
                    - button "Step Forward" [ref=e1557] [cursor=pointer]: ⏭️
                    - button "Reset" [ref=e1558] [cursor=pointer]: 🔄
                - generic [ref=e1559]:
                  - generic [ref=e1560]: Speed
                  - slider "Speed" [ref=e1561] [cursor=pointer]: "1000"
                  - generic [ref=e1562]: 1000ms
            - generic [ref=e1563]:
              - generic [ref=e1564]:
                - generic [ref=e1565]: AES-256 CTR Block Diagram & Visualizer
                - generic [ref=e1566]:
                  - generic [ref=e1567]: "Round 0 Operation:"
                  - generic [ref=e1568]: AddRoundKey (Pre-round)
                - generic [ref=e1569]:
                  - generic [ref=e1570]: 1. Key Expansion (generating round keys 0-10)
                  - generic [ref=e1571]: "2. SubBytes: S-Box non-linear byte substitution"
                  - generic [ref=e1572]: "3. ShiftRows: Cyclic shift of rows in state matrix"
                  - generic [ref=e1573]: "4. MixColumns: Column transformation in GF(2^8)"
                  - generic [ref=e1575]: "5. AddRoundKey: XOR with round key W[0..3]"
                - img [ref=e1577]:
                  - generic [ref=e1579]: Plaintext
                  - generic [ref=e1581]: AES CTR Round 0
                  - generic [ref=e1582]: Counter + Nonce
                  - generic [ref=e1584]: Output
              - generic [ref=e1586]: Output Text
        - generic [ref=e1588]:
          - generic [ref=e1589]:
            - generic [ref=e1590]:
              - heading "RSA Cipher" [level=3] [ref=e1591]
              - paragraph [ref=e1592]: Asymmetric Cryptography (Modular Exponentiation)
            - combobox [ref=e1594]:
              - option "Encrypt Mode" [selected]
              - option "Decrypt Mode"
          - generic [ref=e1595]:
            - generic [ref=e1596]:
              - generic [ref=e1597]:
                - generic [ref=e1598]: Key Generation Panel
                - generic [ref=e1599]:
                  - generic [ref=e1600]:
                    - generic [ref=e1601]: Prime p
                    - spinbutton "Prime p" [ref=e1602]: "61"
                  - generic [ref=e1603]:
                    - generic [ref=e1604]: Prime q
                    - spinbutton "Prime q" [ref=e1605]: "53"
                  - generic [ref=e1606]:
                    - generic [ref=e1607]: Exponent e
                    - spinbutton "Exponent e" [ref=e1608]: "65537"
                - button "Generate RSA Keys" [ref=e1609] [cursor=pointer]
                - generic [ref=e1610]:
                  - generic [ref=e1611]: "Modulus (n):"
                  - generic [ref=e1613]: "Public Key (PEM):"
              - generic [ref=e1615]:
                - generic [ref=e1616]: Input Message (Number or Text)
                - textbox "Input Message (Number or Text)" [ref=e1617]:
                  - /placeholder: Enter message to encrypt or decrypt...
              - generic [ref=e1618]:
                - button "Encrypt" [ref=e1619] [cursor=pointer]
                - button "Decrypt" [ref=e1620] [cursor=pointer]
              - generic [ref=e1621]:
                - generic [ref=e1622]:
                  - generic [ref=e1623]: "Step: 1 / 5"
                  - generic [ref=e1624]:
                    - button "Step Backward" [disabled] [ref=e1625]: ⏮️
                    - button "Play" [ref=e1626] [cursor=pointer]: ▶️
                    - button "Step Forward" [ref=e1627] [cursor=pointer]: ⏭️
                    - button "Reset" [ref=e1628] [cursor=pointer]: 🔄
                - generic [ref=e1629]:
                  - generic [ref=e1630]: Speed
                  - slider "Speed" [ref=e1631] [cursor=pointer]: "1000"
                  - generic [ref=e1632]: 1000ms
            - generic [ref=e1633]:
              - generic [ref=e1634]:
                - generic [ref=e1635]: RSA Mathematical Flow & Diagram
                - generic [ref=e1636]:
                  - generic [ref=e1637]:
                    - text: "Step 1: Choose Primes"
                    - paragraph [ref=e1638]: "Select distinct prime numbers: p = 61, q = 53"
                  - generic [ref=e1639]:
                    - text: "Step 2: Modulus & Totient"
                    - paragraph [ref=e1640]:
                      - text: n = p * q = ?
                      - text: phi(n) = (p-1)*(q-1) = ?
                  - generic [ref=e1641]:
                    - text: "Step 3: Keys Exponent"
                    - paragraph [ref=e1642]:
                      - text: Public e = 65537
                      - text: Private d = e⁻¹ mod phi = ?
                  - generic [ref=e1643]:
                    - text: "Step 4: Encryption"
                    - paragraph [ref=e1644]: Cipher C = M^e mod n
                - generic [ref=e1645]:
                  - generic [ref=e1646]:
                    - generic [ref=e1647]: "Modulus definition:"
                    - generic [ref=e1648]: n = p * q
                  - generic [ref=e1649]:
                    - generic [ref=e1650]: "Totient Relation:"
                    - generic [ref=e1651]: d * e ≡ 1 (mod phi)
                  - generic [ref=e1652]:
                    - generic [ref=e1653]: "Decryption Relation:"
                    - generic [ref=e1654]: M = C^d mod n
                - img [ref=e1656]:
                  - generic [ref=e1658]: Message (M)
                  - generic [ref=e1660]: exponentiation
                  - generic [ref=e1661]: mod n
                  - generic [ref=e1663]: Cipher (C)
              - generic [ref=e1665]: Output Text
        - generic [ref=e1667]:
          - generic [ref=e1669]:
            - heading "SHA-256 Hash" [level=3] [ref=e1670]
            - paragraph [ref=e1671]: Cryptographic Secure Hash Algorithm (256-bit Digest)
          - generic [ref=e1672]:
            - generic [ref=e1673]:
              - generic [ref=e1674]:
                - generic [ref=e1675]: Input Plaintext
                - textbox "Input Plaintext" [ref=e1676]:
                  - /placeholder: Enter text to hash...
              - generic [ref=e1677]:
                - button "Hash (encrypt-btn)" [ref=e1678] [cursor=pointer]
                - button "Compute SHA-256" [ref=e1679] [cursor=pointer]
              - generic [ref=e1680]:
                - generic [ref=e1681]:
                  - generic [ref=e1682]: "Step: 1 / 4"
                  - generic [ref=e1683]:
                    - button "Step Backward" [disabled] [ref=e1684]: ⏮️
                    - button "Play" [ref=e1685] [cursor=pointer]: ▶️
                    - button "Step Forward" [ref=e1686] [cursor=pointer]: ⏭️
                    - button "Reset" [ref=e1687] [cursor=pointer]: 🔄
                - generic [ref=e1688]:
                  - generic [ref=e1689]: Speed
                  - slider "Speed" [ref=e1690] [cursor=pointer]: "1000"
                  - generic [ref=e1691]: 1000ms
            - generic [ref=e1692]:
              - generic [ref=e1693]:
                - generic [ref=e1694]: SHA-256 Block & Message Padding representation
                - generic [ref=e1695]:
                  - generic [ref=e1696]:
                    - generic [ref=e1697]:
                      - generic [ref=e1698]: "Message length:"
                      - generic [ref=e1699]: 0 bits
                    - generic [ref=e1700]:
                      - generic [ref=e1701]: "Padding added (1 + zeros):"
                      - generic [ref=e1702]: pad 1 bit + 447 zero bits
                    - generic [ref=e1703]:
                      - generic [ref=e1704]: "Total Padded size:"
                      - generic [ref=e1705]: 512 bits (1 blocks)
                  - generic [ref=e1706]:
                    - generic [ref=e1707]: "Message Blocks:"
                    - generic [ref=e1709]: Block 1
                - img [ref=e1711]:
                  - generic [ref=e1713]: Message
                  - generic [ref=e1715]: Padding (pad, 1)
                  - generic [ref=e1716]: 64-bit length suffix
                  - generic [ref=e1718]: Hash Digest
              - generic [ref=e1720]: Output Hash
  - contentinfo [ref=e1722]:
    - paragraph [ref=e1723]: © 2026 Cryptography Museum. Educational tool only.
  - alert [ref=e1724]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Tier 4: Real-World Application Scenarios E2E Tests', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('/');
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
> 75  |     expect(caesarDecrypted?.toUpperCase().trim()).toBe('MUSEUM VISIT AT NOON');
      |                                                   ^ Error: expect(received).toBe(expected) // Object.is equality
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
  140 |     await expect(caesarNode).toHaveClass(/active|highlighted/);
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
```