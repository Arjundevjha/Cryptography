"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  caesarEncrypt,
  caesarDecrypt,
  vigenereEncrypt,
  vigenereDecrypt,
  padVigenereKey,
  validateAesKey,
  validateRsaParams,
  sha256PadDescription
} from "./utils/ciphers";

export default function Home() {
  // Navigation / Scroll
  const [activeSection, setActiveSection] = useState("caesar");
  const sectionRefs = {
    caesar: useRef<HTMLDivElement>(null),
    vigenere: useRef<HTMLDivElement>(null),
    affine: useRef<HTMLDivElement>(null),
    scytale: useRef<HTMLDivElement>(null),
    polybius: useRef<HTMLDivElement>(null),
    enigma: useRef<HTMLDivElement>(null),
    aes: useRef<HTMLDivElement>(null),
    rsa: useRef<HTMLDivElement>(null),
    sha256: useRef<HTMLDivElement>(null)
  };

  const scrollToSection = (sectionId: keyof typeof sectionRefs) => {
    setActiveSection(sectionId);
    setCaesarIsPlaying(false);
    setVigenereIsPlaying(false);
    setAffineIsPlaying(false);
    setScytaleIsPlaying(false);
    setPolybiusIsPlaying(false);
    setEnigmaIsPlaying(false);
    setAesIsPlaying(false);
    setRsaIsPlaying(false);
    setShaIsPlaying(false);
    sectionRefs[sectionId].current?.scrollIntoView({ behavior: "smooth" });
    if (typeof window !== "undefined") {
      window.location.hash = sectionId;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (Object.keys(sectionRefs).includes(hash)) {
        const sectionId = hash as keyof typeof sectionRefs;
        setActiveSection(sectionId);
        setTimeout(() => {
          sectionRefs[sectionId].current?.scrollIntoView({ behavior: "auto" });
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [sectionRefs]);

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // -------------------------------------------------------------
  // CAESAR STATE & HANDLERS
  // -------------------------------------------------------------
  const [caesarInput, setCaesarInput] = useState("");
  const [caesarShift, setCaesarShift] = useState("3");
  const [caesarMode, setCaesarMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [caesarOutput, setCaesarOutput] = useState("");
  const [caesarError, setCaesarError] = useState("");
  const [caesarIsPlaying, setCaesarIsPlaying] = useState(false);
  const [caesarIndex, setCaesarIndex] = useState(0);
  const [caesarSpeed, setCaesarSpeed] = useState(1000); // ms per step

  const cleanCaesarShift = useMemo(() => {
    const parsed = parseInt(caesarShift, 10);
    return isNaN(parsed) ? null : parsed;
  }, [caesarShift]);

  const handleCaesarProcess = (
    text: string,
    shiftStr: string,
    mode: "encrypt" | "decrypt"
  ) => {
    if (text.length > 500) {
      setCaesarError("Input string length exceeds limit of 500 characters.");
      setCaesarOutput("");
      return;
    }
    if (!shiftStr) {
      setCaesarError("Shift must be a numeric value.");
      setCaesarOutput("");
      return;
    }
    const parsed = parseInt(shiftStr, 10);
    if (isNaN(parsed)) {
      setCaesarError("Shift must be a numeric value.");
      setCaesarOutput("");
      return;
    }
    setCaesarError("");
    const res = mode === "encrypt" ? caesarEncrypt(text, parsed) : caesarDecrypt(text, parsed);
    setCaesarOutput(res);
  };

  useEffect(() => {
    handleCaesarProcess(caesarInput, caesarShift, caesarMode);
    setCaesarIndex(0);
  }, [caesarInput, caesarShift, caesarMode]);

  // Caesar Playback
  useEffect(() => {
    if (!caesarIsPlaying) return;
    if (prefersReducedMotion) {
      setCaesarIndex(caesarInput.length > 0 ? caesarInput.length - 1 : 0);
      setCaesarIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setCaesarIndex((prev) => {
        if (prev >= caesarInput.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, caesarSpeed);
    return () => clearInterval(interval);
  }, [caesarIsPlaying, caesarInput, caesarSpeed, prefersReducedMotion]);

  // Caesar Concentric SVG Wheels setup
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const getCaesarWheelCoordinates = (index: number, radius: number) => {
    // 0 is top (-90 degrees)
    const angleRad = ((index / 26) * 360 - 90) * (Math.PI / 180);
    const x = 150 + radius * Math.cos(angleRad);
    const y = 150 + radius * Math.sin(angleRad);
    return { x, y };
  };

  const currentCaesarActiveChar = caesarInput[caesarIndex]?.toUpperCase() || "";
  const currentCaesarActiveIndex = alphabet.indexOf(currentCaesarActiveChar);

  // -------------------------------------------------------------
  // VIGENERE STATE & HANDLERS
  // -------------------------------------------------------------
  const [vigenereInput, setVigenereInput] = useState("");
  const [vigenereKey, setVigenereKey] = useState("LEMON");
  const [vigenereMode, setVigenereMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [vigenereOutput, setVigenereOutput] = useState("");
  const [vigenereError, setVigenereError] = useState("");
  const [vigenereIsPlaying, setVigenereIsPlaying] = useState(false);
  const [vigenereIndex, setVigenereIndex] = useState(0);
  const [vigenereSpeed, setVigenereSpeed] = useState(1000);

  const handleVigenereProcess = (
    text: string,
    keyVal: string,
    mode: "encrypt" | "decrypt"
  ) => {
    if (text.length > 500) {
      setVigenereError("Input string length exceeds limit of 500 characters.");
      setVigenereOutput("");
      return;
    }
    if (!keyVal) {
      setVigenereError("Key cannot be empty.");
      setVigenereOutput("");
      return;
    }
    if (!/^[a-zA-Z]+$/.test(keyVal)) {
      setVigenereError("Key must contain only alphabetic characters.");
      setVigenereOutput("");
      return;
    }
    setVigenereError("");
    const res = mode === "encrypt" ? vigenereEncrypt(text, keyVal) : vigenereDecrypt(text, keyVal);
    setVigenereOutput(res);
  };

  useEffect(() => {
    handleVigenereProcess(vigenereInput, vigenereKey, vigenereMode);
    setVigenereIndex(0);
  }, [vigenereInput, vigenereKey, vigenereMode]);

  // Vigenere Playback
  useEffect(() => {
    if (!vigenereIsPlaying) return;
    if (prefersReducedMotion) {
      setVigenereIndex(vigenereInput.length > 0 ? vigenereInput.length - 1 : 0);
      setVigenereIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setVigenereIndex((prev) => {
        if (prev >= vigenereInput.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, vigenereSpeed);
    return () => clearInterval(interval);
  }, [vigenereIsPlaying, vigenereInput, vigenereSpeed, prefersReducedMotion]);

  // Vigenere Row/Col references for auto-scrolling
  const vigenereGridRef = useRef<HTMLDivElement>(null);
  const vigenerePaddedKey = useMemo(() => {
    return padVigenereKey(vigenereInput, vigenereKey);
  }, [vigenereInput, vigenereKey]);

  const currentVigenereActivePChar = vigenereInput[vigenereIndex]?.toUpperCase() || "";
  const currentVigenereActiveKChar = vigenerePaddedKey[vigenereIndex]?.toUpperCase() || "";
  const activeColIdx = alphabet.indexOf(currentVigenereActivePChar);
  const activeRowIdx = alphabet.indexOf(currentVigenereActiveKChar);

  // Auto-scroll Vigenere active cell
  useEffect(() => {
    if (activeColIdx !== -1 && activeRowIdx !== -1 && vigenereGridRef.current) {
      const cellId = `vig-cell-${activeRowIdx}-${activeColIdx}`;
      const cellElement = document.getElementById(cellId);
      if (cellElement) {
        cellElement.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "nearest",
          inline: "nearest"
        });
      }
    }
  }, [vigenereIndex, activeColIdx, activeRowIdx, prefersReducedMotion]);

  // -------------------------------------------------------------
  // AFFINE STATE & HANDLERS
  // -------------------------------------------------------------
  const [affineInput, setAffineInput] = useState("");
  const [affineA, setAffineA] = useState("5");
  const [affineB, setAffineB] = useState("8");
  const [affineMode, setAffineMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [affineOutput, setAffineOutput] = useState("");
  const [affineError, setAffineError] = useState("");
  const [affineIsPlaying, setAffineIsPlaying] = useState(false);
  const [affineIndex, setAffineIndex] = useState(0);
  const [affineSpeed, setAffineSpeed] = useState(1000);

  const cleanAffineParams = useMemo(() => {
    const a = parseInt(affineA, 10);
    const b = parseInt(affineB, 10);
    return { a: isNaN(a) ? null : a, b: isNaN(b) ? null : b };
  }, [affineA, affineB]);

  const handleAffineProcess = async () => {
    if (affineInput.length > 500) {
      setAffineError("Input string length exceeds limit of 500 characters.");
      setAffineOutput("");
      return;
    }
    if (affineA === "" || affineB === "") {
      setAffineError("Parameters a and b are required.");
      setAffineOutput("");
      return;
    }
    const aVal = parseInt(affineA, 10);
    const bVal = parseInt(affineB, 10);
    if (isNaN(aVal) || isNaN(bVal)) {
      setAffineError("Parameters a and b must be valid integers.");
      setAffineOutput("");
      return;
    }
    const aNorm = ((aVal % 26) + 26) % 26;
    // gcd check
    const gcd = (x: number, y: number): number => (!y ? x : gcd(y, x % y));
    if (gcd(aNorm, 26) !== 1) {
      setAffineError("Parameter 'a' must be coprime to 26.");
      setAffineOutput("");
      return;
    }

    setAffineError("");

    try {
      const endpoint = affineMode === "encrypt" ? "/api/affine/encrypt" : "/api/affine/decrypt";
      const payload =
        affineMode === "encrypt"
          ? { plaintext: affineInput, a_key: aVal, b_key: bVal }
          : { ciphertext: affineInput, a_key: aVal, b_key: bVal };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        setAffineError(errData.detail || "API request failed");
        setAffineOutput("");
      } else {
        const data = await response.json();
        setAffineOutput(affineMode === "encrypt" ? data.ciphertext : data.plaintext);
      }
    } catch (err) {
      setAffineError("Network connection to FastAPI server failed.");
      setAffineOutput("");
    }
  };

  useEffect(() => {
    handleAffineProcess();
    setAffineIndex(0);
  }, [affineInput, affineA, affineB, affineMode]);

  // Affine Playback
  useEffect(() => {
    if (!affineIsPlaying) return;
    if (prefersReducedMotion) {
      setAffineIndex(affineInput.length > 0 ? affineInput.length - 1 : 0);
      setAffineIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setAffineIndex((prev) => {
        if (prev >= affineInput.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, affineSpeed);
    return () => clearInterval(interval);
  }, [affineIsPlaying, affineInput, affineSpeed, prefersReducedMotion]);

  const currentAffineActiveChar = affineInput[affineIndex]?.toUpperCase() || "";
  const currentAffineActiveIndex = alphabet.indexOf(currentAffineActiveChar);

  // Compute mapping index
  const computedAffineMappedIndex = useMemo(() => {
    if (currentAffineActiveIndex === -1 || cleanAffineParams.a === null || cleanAffineParams.b === null) {
      return -1;
    }
    if (affineMode === "encrypt") {
      return ((cleanAffineParams.a * currentAffineActiveIndex + cleanAffineParams.b) % 26 + 26) % 26;
    } else {
      // decryption modular inverse of a_key
      const a = cleanAffineParams.a;
      let a_inv = -1;
      for (let i = 0; i < 26; i++) {
        if (((a % 26 + 26) % 26 * i) % 26 === 1) {
          a_inv = i;
          break;
        }
      }
      if (a_inv === -1) return -1;
      return ((a_inv * (currentAffineActiveIndex - cleanAffineParams.b)) % 26 + 26) % 26;
    }
  }, [currentAffineActiveIndex, cleanAffineParams, affineMode]);

  // -------------------------------------------------------------
  // SCYTALE STATE & HANDLERS
  // -------------------------------------------------------------
  const [scytaleInput, setScytaleInput] = useState("");
  const [scytaleWidth, setScytaleWidth] = useState("4");
  const [scytaleMode, setScytaleMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [scytaleOutput, setScytaleOutput] = useState("");
  const [scytaleError, setScytaleError] = useState("");
  const [scytaleIsPlaying, setScytaleIsPlaying] = useState(false);
  const [scytaleIndex, setScytaleIndex] = useState(0);
  const [scytaleSpeed, setScytaleSpeed] = useState(1000);

  const cleanScytaleWidth = useMemo(() => {
    const parsed = parseInt(scytaleWidth, 10);
    return isNaN(parsed) ? null : parsed;
  }, [scytaleWidth]);

  const handleScytaleProcess = async () => {
    if (!scytaleInput) {
      setScytaleError("");
      setScytaleOutput("");
      return;
    }
    if (scytaleInput.length > 500) {
      setScytaleError("Input string length exceeds limit of 500 characters.");
      setScytaleOutput("");
      return;
    }
    if (!scytaleWidth) {
      setScytaleError("Width must be a numeric value.");
      setScytaleOutput("");
      return;
    }
    const parsedWidth = parseInt(scytaleWidth, 10);
    if (isNaN(parsedWidth)) {
      setScytaleError("Width must be a numeric value.");
      setScytaleOutput("");
      return;
    }
    if (parsedWidth < 2) {
      setScytaleError("Width must be at least 2 for Scytale.");
      setScytaleOutput("");
      return;
    }
    setScytaleError("");

    try {
      const endpoint = scytaleMode === "encrypt" ? "/api/scytale/encrypt" : "/api/scytale/decrypt";
      const payload = scytaleMode === "encrypt"
        ? { plaintext: scytaleInput, width: parsedWidth }
        : { ciphertext: scytaleInput, width: parsedWidth };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errData = await response.json();
        setScytaleError(errData.detail || "API request failed");
        setScytaleOutput("");
      } else {
        const data = await response.json();
        setScytaleOutput(scytaleMode === "encrypt" ? data.ciphertext : data.plaintext);
      }
    } catch (err) {
      setScytaleError("Network connection to FastAPI server failed.");
      setScytaleOutput("");
    }
  };

  useEffect(() => {
    handleScytaleProcess();
    setScytaleIndex(0);
  }, [scytaleInput, scytaleWidth, scytaleMode]);

  useEffect(() => {
    if (!scytaleIsPlaying) return;
    if (prefersReducedMotion) {
      setScytaleIndex(scytaleInput.length > 0 ? scytaleInput.length - 1 : 0);
      setScytaleIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setScytaleIndex((prev) => {
        if (prev >= scytaleInput.length - 1) return 0;
        return prev + 1;
      });
    }, scytaleSpeed);
    return () => clearInterval(interval);
  }, [scytaleIsPlaying, scytaleInput, scytaleSpeed, prefersReducedMotion]);

  // -------------------------------------------------------------
  // POLYBIUS STATE & HANDLERS
  // -------------------------------------------------------------
  const [polybiusInput, setPolybiusInput] = useState("");
  const [polybiusKey, setPolybiusKey] = useState("abcdefghiklmnopqrstuvwxyz");
  const [polybiusMode, setPolybiusMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [polybiusOutput, setPolybiusOutput] = useState("");
  const [polybiusError, setPolybiusError] = useState("");
  const [polybiusIsPlaying, setPolybiusIsPlaying] = useState(false);
  const [polybiusIndex, setPolybiusIndex] = useState(0);
  const [polybiusSpeed, setPolybiusSpeed] = useState(1000);

  const cleanPolybiusKey = useMemo(() => {
    const cleanKey = polybiusKey.trim() === "" ? "abcdefghiklmnopqrstuvwxyz" : polybiusKey;
    return cleanKey.toLowerCase().replace(/j/g, "i");
  }, [polybiusKey]);

  const handlePolybiusProcess = async () => {
    if (!polybiusInput) {
      setPolybiusError("");
      setPolybiusOutput("");
      return;
    }
    if (polybiusInput.length > 500) {
      setPolybiusError("Input string length exceeds limit of 500 characters.");
      setPolybiusOutput("");
      return;
    }
    
    const keyClean = cleanPolybiusKey;
    if (keyClean.length !== 25 || new Set(keyClean).size !== 25 || !/^[a-z]+$/.test(keyClean)) {
      setPolybiusError("Key must contain exactly 25 unique letters.");
      setPolybiusOutput("");
      return;
    }

    if (polybiusMode === "decrypt") {
      let isValid = true;
      let errorMsg = "";
      let i = 0;
      while (i < polybiusInput.length) {
        const char = polybiusInput[i];
        if (/[0-9]/.test(char)) {
          if (i + 1 < polybiusInput.length && /[0-9]/.test(polybiusInput[i+1])) {
            const d1 = parseInt(char, 10);
            const d2 = parseInt(polybiusInput[i+1], 10);
            if (!(d1 >= 1 && d1 <= 5 && d2 >= 1 && d2 <= 5)) {
              isValid = false;
              errorMsg = "Coordinates must be between 1 and 5";
              break;
            }
            i += 2;
          } else {
            isValid = false;
            errorMsg = "Digits must appear in pairs";
            break;
          }
        } else {
          i++;
        }
      }

      if (!isValid) {
        setPolybiusError(errorMsg);
        setPolybiusOutput("");
        return;
      }
    }

    setPolybiusError("");

    try {
      const endpoint = polybiusMode === "encrypt" ? "/api/polybius/encrypt" : "/api/polybius/decrypt";
      const payload = polybiusMode === "encrypt"
        ? { plaintext: polybiusInput, key: keyClean }
        : { ciphertext: polybiusInput, key: keyClean };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errData = await response.json();
        setPolybiusError(errData.detail || "API request failed");
        setPolybiusOutput("");
      } else {
        const data = await response.json();
        setPolybiusOutput(polybiusMode === "encrypt" ? data.ciphertext : data.plaintext);
      }
    } catch (err) {
      setPolybiusError("Network connection to FastAPI server failed.");
      setPolybiusOutput("");
    }
  };

  useEffect(() => {
    handlePolybiusProcess();
    setPolybiusIndex(0);
  }, [polybiusInput, polybiusKey, polybiusMode]);

  useEffect(() => {
    if (!polybiusIsPlaying) return;
    if (prefersReducedMotion) {
      setPolybiusIndex(polybiusInput.length > 0 ? polybiusInput.length - 1 : 0);
      setPolybiusIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setPolybiusIndex((prev) => {
        if (prev >= polybiusInput.length - 1) return 0;
        return prev + 1;
      });
    }, polybiusSpeed);
    return () => clearInterval(interval);
  }, [polybiusIsPlaying, polybiusInput, polybiusSpeed, prefersReducedMotion]);

  // Highlight coordinates calculations for Polybius Visualizer
  const polybiusActiveCoords = useMemo(() => {
    const keyClean = cleanPolybiusKey;
    let activeRow = -1;
    let activeCol = -1;
    
    if (polybiusMode === "encrypt") {
      const activeChar = polybiusInput[polybiusIndex]?.toLowerCase().replace(/j/g, "i") || "";
      const keyIdx = keyClean.indexOf(activeChar);
      if (keyIdx !== -1) {
        activeRow = Math.floor(keyIdx / 5) + 1;
        activeCol = (keyIdx % 5) + 1;
      }
    } else {
      let digitIdx = 0;
      let activePairIndex = -1;
      for (let k = 0; k <= polybiusIndex && k < polybiusInput.length; k++) {
        if (/[0-9]/.test(polybiusInput[k])) {
          activePairIndex = Math.floor(digitIdx / 2);
          digitIdx++;
        }
      }
      const allDigits = polybiusInput.replace(/[^0-9]/g, "");
      if (activePairIndex !== -1 && activePairIndex * 2 + 1 < allDigits.length) {
        activeRow = parseInt(allDigits[activePairIndex * 2], 10);
        activeCol = parseInt(allDigits[activePairIndex * 2 + 1], 10);
      }
    }
    return { row: activeRow, col: activeCol };
  }, [polybiusInput, polybiusIndex, polybiusMode, cleanPolybiusKey]);


  // -------------------------------------------------------------
  // ENIGMA STATE & HANDLERS
  // -------------------------------------------------------------
  const [enigmaInput, setEnigmaInput] = useState("");
  const [enigmaRotors, setEnigmaRotors] = useState("I-II-III");
  const [enigmaPositions, setEnigmaPositions] = useState("A-A-A");
  const [enigmaRings, setEnigmaRings] = useState("A-A-A");
  const [enigmaPlugboard, setEnigmaPlugboard] = useState("");
  const [enigmaOutput, setEnigmaOutput] = useState("");
  const [enigmaError, setEnigmaError] = useState("");
  const [enigmaIsPlaying, setEnigmaIsPlaying] = useState(false);
  const [enigmaIndex, setEnigmaIndex] = useState(0);
  const [enigmaSpeed, setEnigmaSpeed] = useState(1000);

  const handleEnigmaProcess = async () => {
    if (!enigmaInput) {
      setEnigmaError("");
      setEnigmaOutput("");
      return;
    }
    if (enigmaInput.length > 500) {
      setEnigmaError("Input string length exceeds limit of 500 characters.");
      setEnigmaOutput("");
      return;
    }
    
    const rotorList = enigmaRotors.split("-").map(r => r.trim().toUpperCase());
    if (rotorList.length !== 3) {
      setEnigmaError("Exactly 3 rotors must be specified (e.g. I-II-III).");
      setEnigmaOutput("");
      return;
    }
    if (new Set(rotorList).size !== 3) {
      setEnigmaError("Duplicate rotors are not allowed.");
      setEnigmaOutput("");
      return;
    }
    const allowedRotors = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    for (const r of rotorList) {
      if (!allowedRotors.includes(r)) {
        setEnigmaError(`Invalid rotor '${r}'.`);
        setEnigmaOutput("");
        return;
      }
    }

    const posList = enigmaPositions.split("-").map(p => p.trim().toUpperCase());
    if (posList.length !== 3) {
      setEnigmaError("Exactly 3 positions must be specified (e.g. A-A-A).");
      setEnigmaOutput("");
      return;
    }
    for (const p of posList) {
      if (p.length !== 1 || !/^[A-Z]$/.test(p)) {
        setEnigmaError("Rotor positions must be single letters.");
        setEnigmaOutput("");
        return;
      }
    }

    const ringList = enigmaRings.split("-").map(r => r.trim().toUpperCase());
    if (ringList.length !== 3) {
      setEnigmaError("Exactly 3 ring settings must be specified (e.g. A-A-A or 1-1-1).");
      setEnigmaOutput("");
      return;
    }
    for (const r of ringList) {
      if (r.length === 0) {
        setEnigmaError("Invalid ring setting");
        setEnigmaOutput("");
        return;
      }
      if (/^[0-9]+$/.test(r)) {
        const val = parseInt(r, 10);
        if (val < 1 || val > 26) {
          setEnigmaError("Invalid ring setting");
          setEnigmaOutput("");
          return;
        }
      } else if (r.length === 1 && /^[A-Z]$/.test(r)) {
        // valid letter
      } else {
        setEnigmaError("Invalid ring setting");
        setEnigmaOutput("");
        return;
      }
    }

    const pbPairs = enigmaPlugboard.split(/\s+/).filter(Boolean).map(s => s.toUpperCase());
    const seenChars = new Set<string>();
    for (const pair of pbPairs) {
      if (pair.length !== 2 || !/^[A-Z]{2}$/.test(pair)) {
        setEnigmaError("Invalid plugboard swap format");
        setEnigmaOutput("");
        return;
      }
      for (const char of pair) {
        if (seenChars.has(char)) {
          setEnigmaError("Duplicate plugboard connection");
          setEnigmaOutput("");
          return;
        }
        seenChars.add(char);
      }
    }

    setEnigmaError("");

    try {
      const payload = {
        plaintext: enigmaInput,
        rotors: rotorList,
        positions: posList,
        rings: ringList,
        plugboard: pbPairs
      };
      const response = await fetch("/api/enigma/encipher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errData = await response.json();
        setEnigmaError(errData.detail || "API request failed");
        setEnigmaOutput("");
      } else {
        const data = await response.json();
        setEnigmaOutput(data.ciphertext);
      }
    } catch (err) {
      setEnigmaError("Network connection to FastAPI server failed.");
      setEnigmaOutput("");
    }
  };

  useEffect(() => {
    handleEnigmaProcess();
    setEnigmaIndex(0);
  }, [enigmaInput, enigmaRotors, enigmaPositions, enigmaRings, enigmaPlugboard]);

  useEffect(() => {
    if (!enigmaIsPlaying) return;
    if (prefersReducedMotion) {
      setEnigmaIndex(enigmaInput.length > 0 ? enigmaInput.length - 1 : 0);
      setEnigmaIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setEnigmaIndex((prev) => {
        if (prev >= enigmaInput.length - 1) return 0;
        return prev + 1;
      });
    }, enigmaSpeed);
    return () => clearInterval(interval);
  }, [enigmaIsPlaying, enigmaInput, enigmaSpeed, prefersReducedMotion]);

  // Enigma visual coordinates and wiring setups
  const ROTOR_WIRINGS: Record<string, { wiring: string, notch: string }> = {
    I: { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: "Q" },
    II: { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: "W" },
    III: { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: "V" },
    IV: { wiring: "ESOVPZJAYQUIRHXLNFTGKDCMWB", notch: "J" },
    V: { wiring: "VZBRGITYUPSDNHLXAWMJQOFECK", notch: "Z" },
    VI: { wiring: "JPGVOUMFYQBENHZRDKASXLICTW", notch: "M" },
    VII: { wiring: "NZJHGRCXMYSWBOUFAIVLPEKQDT", notch: "Z" },
    VIII: { wiring: "FKQHTLXOCBJSPDZRAMEWNIUYGV", notch: "M" }
  };

  const getRotorPositionsAtStep = (initial: string[], step: number) => {
    let pos1 = initial[0]?.charCodeAt(0) - 65 || 0;
    let pos2 = initial[1]?.charCodeAt(0) - 65 || 0;
    let pos3 = initial[2]?.charCodeAt(0) - 65 || 0;
    
    const rotorList = enigmaRotors.split("-").map(r => r.trim().toUpperCase());
    const notches: Record<string, number> = {
      I: 16, II: 22, III: 21, IV: 9, V: 25, VI: 12, VII: 25, VIII: 12
    };
    
    const n1 = notches[rotorList[0]] || 16;
    const n2 = notches[rotorList[1]] || 22;
    const n3 = notches[rotorList[2]] || 21;
    
    for (let s = 0; s < step; s++) {
      if (pos2 === n2 && pos3 === n3) {
        pos1 = (pos1 + 1) % 26;
        pos2 = (pos2 + 1) % 26;
        pos3 = (pos3 + 1) % 26;
      } else if (pos2 === n2) {
        pos1 = (pos1 + 1) % 26;
        pos2 = (pos2 + 1) % 26;
        pos3 = (pos3 + 1) % 26;
      } else if (pos3 === n3) {
        pos2 = (pos2 + 1) % 26;
        pos3 = (pos3 + 1) % 26;
      } else {
        pos3 = (pos3 + 1) % 26;
      }
    }
    return [String.fromCharCode(pos1 + 65), String.fromCharCode(pos2 + 65), String.fromCharCode(pos3 + 65)];
  };

  const enigmaVisualPath = useMemo(() => {
    const activeChar = enigmaInput[enigmaIndex]?.toUpperCase() || "";
    if (!activeChar || !/^[A-Z]$/.test(activeChar)) return null;

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const rotorList = enigmaRotors.split("-").map(r => r.trim().toUpperCase());
    const posList = enigmaPositions.split("-").map(p => p.trim().toUpperCase());
    const ringList = enigmaRings.split("-").map(r => r.trim().toUpperCase());
    const pbPairs = enigmaPlugboard.split(/\s+/).filter(Boolean).map(s => s.toUpperCase());

    if (rotorList.length !== 3 || posList.length !== 3 || ringList.length !== 3) return null;

    const pbMap = new Map<string, string>();
    for (const pair of pbPairs) {
      if (pair.length === 2) {
        pbMap.set(pair[0], pair[1]);
        pbMap.set(pair[1], pair[0]);
      }
    }

    const ringOffsets = ringList.map((r) => {
      if (/^[0-9]+$/.test(r)) {
        return parseInt(r, 10) - 1;
      } else {
        return r.charCodeAt(0) - 65;
      }
    });

    const stepPositions = getRotorPositionsAtStep(posList, enigmaIndex);
    const rPos = stepPositions.map(p => p.charCodeAt(0) - 65);

    const pbInChar = pbMap.get(activeChar) || activeChar;
    const signalKeyboard = alphabet.indexOf(activeChar);
    const signalPbIn = alphabet.indexOf(pbInChar);

    // Right to Left (Rotor 3 -> Rotor 2 -> Rotor 1 -> Reflector)
    const r3Wiring = ROTOR_WIRINGS[rotorList[2]]?.wiring || "BDFHJLCPRTXVZNYEIWGAKMUSQO";
    let offset3 = (rPos[2] - ringOffsets[2] + 26) % 26;
    let r3In = (signalPbIn + offset3) % 26;
    let r3Out = (alphabet.indexOf(r3Wiring[r3In]) - offset3 + 26) % 26;

    const r2Wiring = ROTOR_WIRINGS[rotorList[1]]?.wiring || "AJDKSIRUXBLHWTMCQGZNPYFVOE";
    let offset2 = (rPos[1] - ringOffsets[1] + 26) % 26;
    let r2In = (r3Out + offset2) % 26;
    let r2Out = (alphabet.indexOf(r2Wiring[r2In]) - offset2 + 26) % 26;

    const r1Wiring = ROTOR_WIRINGS[rotorList[0]]?.wiring || "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
    let offset1 = (rPos[0] - ringOffsets[0] + 26) % 26;
    let r1In = (r2Out + offset1) % 26;
    let r1Out = (alphabet.indexOf(r1Wiring[r1In]) - offset1 + 26) % 26;

    const reflectorB = "YRUHQSLDPXNGOKMIEBFZCWVJAT";
    let refOut = alphabet.indexOf(reflectorB[r1Out]);

    // Left to Right (Reflector -> Rotor 1 -> Rotor 2 -> Rotor 3 -> Plugboard)
    let r1InB = (refOut + offset1) % 26;
    let r1OutB = (r1Wiring.indexOf(alphabet[r1InB]) - offset1 + 26) % 26;

    let r2InB = (r1OutB + offset2) % 26;
    let r2OutB = (r2Wiring.indexOf(alphabet[r2InB]) - offset2 + 26) % 26;

    let r3InB = (r2OutB + offset3) % 26;
    let r3OutB = (r3Wiring.indexOf(alphabet[r3InB]) - offset3 + 26) % 26;

    const finalChar = pbMap.get(alphabet[r3OutB]) || alphabet[r3OutB];
    const signalPbOut = alphabet.indexOf(finalChar);

    return {
      keyboard: signalKeyboard,
      pbIn: signalPbIn,
      r3In,
      r3Out,
      r2In,
      r2Out,
      r1In,
      r1Out,
      refOut,
      r1OutB,
      r2OutB,
      r3OutB,
      pbOut: signalPbOut,
      stepPositions
    };
  }, [enigmaInput, enigmaIndex, enigmaRotors, enigmaPositions, enigmaRings, enigmaPlugboard]);

  // -------------------------------------------------------------
  // AES STATE & HANDLERS
  // -------------------------------------------------------------
  const [aesInput, setAesInput] = useState("");
  const [aesKey, setAesKey] = useState("1234567890123456");
  const [aesMode, setAesMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [aesFormat, setAesFormat] = useState<"text" | "hex">("text");
  const [aesKeyFormat, setAesKeyFormat] = useState<"text" | "hex">("text");
  const [aesOutput, setAesOutput] = useState("");
  const [aesNonce, setAesNonce] = useState("");
  const [aesError, setAesError] = useState("");
  const [aesIsPlaying, setAesIsPlaying] = useState(false);
  const [aesIndex, setAesIndex] = useState(0); // 0 to 10 for rounds
  const [aesSpeed, setAesSpeed] = useState(1000);

  // AES real-time client-side validation
  useEffect(() => {
    if (aesInput === "") {
      setAesError("");
      setAesOutput("");
      return;
    }
    if (aesInput.length > 500) {
      setAesError("Input string length exceeds limit of 500 characters.");
      setAesOutput("");
      return;
    }
    const keyVal = validateAesKey(aesKey, aesKeyFormat);
    if (!keyVal.isValid) {
      setAesError(keyVal.error || "Invalid key size or format.");
      setAesOutput("");
      return;
    }
    setAesError("");
  }, [aesInput, aesKey, aesKeyFormat]);

  // AES Playback for Rounds
  useEffect(() => {
    if (!aesIsPlaying) return;
    if (prefersReducedMotion) {
      setAesIndex(10);
      setAesIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setAesIndex((prev) => {
        if (prev >= 10) return 0;
        return prev + 1;
      });
    }, aesSpeed);
    return () => clearInterval(interval);
  }, [aesIsPlaying, aesSpeed, prefersReducedMotion]);

  const handleAesProcess = async (currentMode?: "encrypt" | "decrypt") => {
    const targetMode = currentMode || aesMode;
    if (aesInput === "") {
      setAesOutput("");
      return;
    }
    if (aesInput.length > 500) {
      setAesError("Input string length exceeds limit of 500 characters.");
      setAesOutput("");
      return;
    }
    const keyVal = validateAesKey(aesKey, aesKeyFormat);
    if (!keyVal.isValid) {
      setAesError(keyVal.error || "Invalid key size or format.");
      setAesOutput("");
      return;
    }

    setAesError("");
    try {
      if (targetMode === "encrypt") {
        const response = await fetch("/api/aes/encrypt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plaintext: aesInput,
            key: aesKey,
            key_format: aesKeyFormat,
            plaintext_format: aesFormat
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          setAesError(errData.detail || "AES Encryption failed");
          setAesOutput("");
        } else {
          const data = await response.json();
          setAesOutput(data.ciphertext);
          setAesNonce(data.nonce);
        }
      } else {
        const response = await fetch("/api/aes/decrypt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ciphertext: aesInput,
            key: aesKey,
            nonce: aesNonce || "0".repeat(24),
            key_format: aesKeyFormat
          })
        });
        if (!response.ok) {
          const errData = await response.json();
          setAesError(errData.detail || "AES Decryption failed");
          setAesOutput("");
        } else {
          const data = await response.json();
          setAesOutput(data.plaintext);
        }
      }
    } catch (err) {
      setAesError("Network connection to FastAPI server failed.");
      setAesOutput("");
    }
  };

  // -------------------------------------------------------------
  // RSA STATE & HANDLERS
  // -------------------------------------------------------------
  const [rsaP, setRsaP] = useState("61");
  const [rsaQ, setRsaQ] = useState("53");
  const [rsaE, setRsaE] = useState("65537");
  const [rsaN, setRsaN] = useState("");
  const [rsaPhi, setRsaPhi] = useState("");
  const [rsaD, setRsaD] = useState("");
  const [rsaPublicKey, setRsaPublicKey] = useState("");
  const [rsaPrivateKey, setRsaPrivateKey] = useState("");
  const [rsaInput, setRsaInput] = useState("");
  const [rsaMode, setRsaMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [rsaOutput, setRsaOutput] = useState("");
  const [rsaError, setRsaError] = useState("");
  const [rsaIsPlaying, setRsaIsPlaying] = useState(false);
  const [rsaIndex, setRsaIndex] = useState(0); // step 0 to 4
  const [rsaSpeed, setRsaSpeed] = useState(1000);

  // RSA real-time validation
  useEffect(() => {
    if (!rsaP || !rsaQ) {
      setRsaError("");
      return;
    }
    const pVal = parseInt(rsaP, 10);
    const qVal = parseInt(rsaQ, 10);
    const eVal = parseInt(rsaE, 10) || 65537;
    if (isNaN(pVal) || isNaN(qVal)) {
      setRsaError("Primes must be valid integers.");
      return;
    }
    const valResult = validateRsaParams(pVal, qVal, eVal);
    if (!valResult.isValid) {
      setRsaError(valResult.error || "Invalid RSA parameters.");
    } else {
      setRsaError("");
    }
  }, [rsaP, rsaQ, rsaE]);

  useEffect(() => {
    if (rsaInput === "") {
      setRsaOutput("");
      if (rsaError.includes("exceeds")) {
        setRsaError("");
      }
      return;
    }
    if (rsaInput.length > 500) {
      setRsaError("Input string length exceeds limit of 500 characters.");
      setRsaOutput("");
    } else {
      if (rsaError.includes("exceeds")) {
        setRsaError("");
      }
    }
  }, [rsaInput]);

  // RSA Playback
  useEffect(() => {
    if (!rsaIsPlaying) return;
    if (prefersReducedMotion) {
      setRsaIndex(4);
      setRsaIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setRsaIndex((prev) => {
        if (prev >= 4) return 0;
        return prev + 1;
      });
    }, rsaSpeed);
    return () => clearInterval(interval);
  }, [rsaIsPlaying, rsaSpeed, prefersReducedMotion]);

  const handleRsaKeygen = async () => {
    const pVal = parseInt(rsaP, 10);
    const qVal = parseInt(rsaQ, 10);
    const eVal = parseInt(rsaE, 10) || 65537;

    if (isNaN(pVal) || isNaN(qVal)) {
      setRsaError("Primes must be valid integers.");
      return;
    }

    const valResult = validateRsaParams(pVal, qVal, eVal);
    if (!valResult.isValid) {
      setRsaError(valResult.error || "Invalid RSA parameters.");
      return;
    }

    setRsaError("");
    try {
      const response = await fetch("/api/rsa/keygen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ p: pVal, q: qVal, e: eVal })
      });
      if (!response.ok) {
        const errData = await response.json();
        setRsaError(errData.detail || "Key generation failed");
      } else {
        const data = await response.json();
        setRsaN(String(data.n));
        setRsaPhi(String(data.phi));
        setRsaD(String(data.d));
        setRsaPublicKey(data.public_key);
        setRsaPrivateKey(data.private_key);
      }
    } catch (err) {
      setRsaError("Network connection to FastAPI server failed.");
    }
  };

  const handleRsaProcess = async (currentMode?: "encrypt" | "decrypt") => {
    const targetMode = currentMode || rsaMode;
    if (rsaInput === "") {
      setRsaOutput("");
      return;
    }
    if (rsaInput.length > 500) {
      setRsaError("Input string length exceeds limit of 500 characters.");
      return;
    }
    if (targetMode === "encrypt" && !rsaPublicKey) {
      setRsaError("Public key is required for encryption. Generate keys first.");
      return;
    }
    if (targetMode === "decrypt" && !rsaPrivateKey) {
      setRsaError("Private key is required for decryption. Generate keys first.");
      return;
    }

    setRsaError("");
    try {
      const endpoint = targetMode === "encrypt" ? "/api/rsa/encrypt" : "/api/rsa/decrypt";
      const bodyPayload = targetMode === "encrypt"
        ? { plaintext: rsaInput, public_key: rsaPublicKey }
        : { ciphertext: rsaInput, private_key: rsaPrivateKey };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errData = await response.json();
        setRsaError(errData.detail || "RSA process failed");
        setRsaOutput("");
      } else {
        const data = await response.json();
        setRsaOutput(targetMode === "encrypt" ? data.ciphertext : data.plaintext);
      }
    } catch (err) {
      setRsaError("Network connection to FastAPI server failed.");
      setRsaOutput("");
    }
  };

  // -------------------------------------------------------------
  // SHA-256 STATE & HANDLERS
  // -------------------------------------------------------------
  const [shaInput, setShaInput] = useState("");
  const [shaOutput, setShaOutput] = useState("");
  const [shaError, setShaError] = useState("");
  const [shaIsPlaying, setShaIsPlaying] = useState(false);
  const [shaIndex, setShaIndex] = useState(0); // step 0 to 3
  const [shaSpeed, setShaSpeed] = useState(1000);

  useEffect(() => {
    if (shaInput.length > 500) {
      setShaError("Input string length exceeds limit of 500 characters.");
      setShaOutput("");
    } else {
      setShaError("");
    }
  }, [shaInput]);

  // SHA-256 Playback
  useEffect(() => {
    if (!shaIsPlaying) return;
    if (prefersReducedMotion) {
      setShaIndex(3);
      setShaIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setShaIndex((prev) => {
        if (prev >= 3) return 0;
        return prev + 1;
      });
    }, shaSpeed);
    return () => clearInterval(interval);
  }, [shaIsPlaying, shaSpeed, prefersReducedMotion]);

  // Auto-pause playing animations when switching sections
  useEffect(() => {
    if (activeSection !== "caesar") setCaesarIsPlaying(false);
    if (activeSection !== "vigenere") setVigenereIsPlaying(false);
    if (activeSection !== "affine") setAffineIsPlaying(false);
    if (activeSection !== "scytale") setScytaleIsPlaying(false);
    if (activeSection !== "polybius") setPolybiusIsPlaying(false);
    if (activeSection !== "enigma") setEnigmaIsPlaying(false);
    if (activeSection !== "aes") setAesIsPlaying(false);
    if (activeSection !== "rsa") setRsaIsPlaying(false);
    if (activeSection !== "sha255" && activeSection !== "sha256") setShaIsPlaying(false);
  }, [activeSection]);


  const handleShaProcess = async () => {
    if (shaInput.length > 500) {
      setShaError("Input string length exceeds limit of 500 characters.");
      return;
    }
    setShaError("");
    try {
      const response = await fetch("/api/sha256", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plaintext: shaInput })
      });
      if (!response.ok) {
        const errData = await response.json();
        setShaError(errData.detail || "SHA-256 failed");
        setShaOutput("");
      } else {
        const data = await response.json();
        setShaOutput(data.hash);
      }
    } catch (err) {
      setShaError("Network connection to FastAPI server failed.");
      setShaOutput("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-serif">
      {/* Horizontal Scrollable Timeline Navigation */}
      <div className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 py-3 shadow-md">
        <nav
          className="container mx-auto px-4 flex space-x-4 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-label="Chronological Timeline"
        >
          {[
            { id: "caesar", name: "Caesar Cipher (50 BC)" },
            { id: "vigenere", name: "Vigenère (1553)" },
            { id: "affine", name: "Affine Cipher (Math)" },
            { id: "scytale", name: "Scytale" },
            { id: "polybius", name: "Polybius Square" },
            { id: "enigma", name: "Enigma Machine" },
            { id: "aes", name: "AES Standard" },
            { id: "rsa", name: "RSA Standard" },
            { id: "sha256", name: "SHA-256 Hash" }
          ].map((node) => (
            <button
              key={node.id}
              onClick={() => scrollToSection(node.id as keyof typeof sectionRefs)}
              data-testid={`timeline-node-${node.id}`}
              className={`px-4 py-2 rounded-full text-xs font-mono border transition ${
                activeSection === node.id
                  ? "bg-amber-500 border-amber-500 text-slate-950 font-bold"
                  : "bg-slate-850 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              aria-current={activeSection === node.id ? "location" : undefined}
            >
              {node.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold tracking-tight text-white mb-4">
            🔒 Cryptography Museum
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Interact with classical substitution ciphers, historical enigma machine emulators, and modern cryptographic standards.
          </p>
        </div>

        {/* -------------------------------------------------------------
            CAESAR CIPHER EXHIBIT
            ------------------------------------------------------------- */}
        <section
          id="caesar"
          ref={sectionRefs.caesar}
          data-testid="exhibit-caesar"
          className="mb-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl"
        >
          <h3 className="text-3xl font-bold text-amber-400 mb-2">Caesar Cipher</h3>
          <p className="text-slate-400 mb-6 font-serif">
            A basic shift cipher where each letter is replaced by a letter some fixed number of positions down the alphabet.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="input-caesar" className="block text-sm font-mono text-slate-300 mb-2">
                  Input Text (Max 500 Chars)
                </label>
                <textarea
                  id="input-caesar"
                  data-testid="input-text-caesar"
                  className="w-full h-32 px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={caesarInput}
                  onChange={(e) => setCaesarInput(e.target.value)}
                  maxLength={505} // Allow typing more to trigger boundary tests
                  placeholder="Enter secret message..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="shift-caesar" className="block text-sm font-mono text-slate-300 mb-2">
                    Shift Amount
                  </label>
                  <input
                    id="shift-caesar"
                    type="text"
                    data-testid="param-shift-caesar"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={caesarShift}
                    onChange={(e) => setCaesarShift(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="mode-caesar" className="block text-sm font-mono text-slate-300 mb-2">
                    Mode Select
                  </label>
                  <select
                    id="mode-caesar"
                    data-testid="mode-select-caesar"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={caesarMode}
                    onChange={(e) => setCaesarMode(e.target.value as "encrypt" | "decrypt")}
                  >
                    <option value="encrypt">Encrypt</option>
                    <option value="decrypt">Decrypt</option>
                  </select>
                </div>
              </div>

              {/* Mode button triggers for Playwright tests */}
              <div className="flex space-x-2">
                <button
                  data-testid="encrypt-btn-caesar"
                  onClick={() => setCaesarMode("encrypt")}
                  className={`flex-1 py-2 rounded font-mono text-sm border transition ${
                    caesarMode === "encrypt" ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  Encrypt Mode
                </button>
                <button
                  data-testid="decrypt-btn-caesar"
                  onClick={() => setCaesarMode("decrypt")}
                  className={`flex-1 py-2 rounded font-mono text-sm border transition ${
                    caesarMode === "decrypt" ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  Decrypt Mode
                </button>
              </div>

              {caesarError && (
                <div
                  data-testid="error-message-caesar"
                  className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-red-200 text-sm font-mono"
                  role="alert"
                >
                  {caesarError}
                </div>
              )}

              <div>
                <span className="block text-sm font-mono text-slate-300 mb-2">Output Text</span>
                <div
                  data-testid="output-text-caesar"
                  className="w-full min-h-[50px] p-4 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-mono break-all whitespace-pre-wrap"
                >
                  {caesarOutput}
                </div>
              </div>
            </div>

            {/* CAESAR VISUALIZER */}
            <div className="flex flex-col justify-between items-center border border-slate-800 rounded-xl p-6 bg-slate-950/40">
              <h4 className="text-lg font-bold text-slate-300 mb-4 font-serif">Concentric Wheel Visualizer</h4>
              
              <div data-testid="visualizer-caesar" className="w-[300px] h-[300px] relative">
                <svg width="300" height="300" className="mx-auto" aria-hidden="true">
                  {/* Outer Wheel Circle (Plaintext) */}
                  <circle cx="150" cy="150" r="110" fill="none" stroke="#334155" strokeWidth="2" />
                  {/* Inner Wheel Circle (Ciphertext) */}
                  <circle cx="150" cy="150" r="80" fill="none" stroke="#475569" strokeWidth="2" />

                  {/* Outer Alphabet Ring */}
                  {alphabet.split("").map((letter, index) => {
                    const coords = getCaesarWheelCoordinates(index, 110);
                    const isActive = currentCaesarActiveChar === letter;
                    return (
                      <text
                        key={`outer-${letter}`}
                        x={coords.x}
                        y={coords.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`font-mono text-xs ${isActive ? "fill-amber-400 font-extrabold scale-110" : "fill-slate-500"}`}
                      >
                        {letter}
                      </text>
                    );
                  })}

                  {/* Inner Alphabet Ring (Rotated based on shift) */}
                  {alphabet.split("").map((letter, index) => {
                    const shift = cleanCaesarShift !== null ? cleanCaesarShift : 0;
                    const rawShiftedIndex = (index + (caesarMode === "encrypt" ? shift : 26 - shift)) % 26;
                    const shiftedIndex = ((rawShiftedIndex % 26) + 26) % 26;
                    const coords = getCaesarWheelCoordinates(index, 80);
                    const isInnerActive =
                      currentCaesarActiveIndex !== -1 &&
                      (currentCaesarActiveIndex === index ||
                        (caesarMode === "encrypt"
                          ? ((currentCaesarActiveIndex + shift) % 26 + 26) % 26 === shiftedIndex
                          : ((currentCaesarActiveIndex - shift + 26) % 26 + 26) % 26 === shiftedIndex));
                    
                    const expectedShifted = caesarMode === "encrypt"
                      ? (currentCaesarActiveIndex + shift) % 26
                      : (currentCaesarActiveIndex - shift + 26) % 26;
                    const isMatchedInner = currentCaesarActiveIndex !== -1 && shiftedIndex === ((expectedShifted % 26 + 26) % 26);

                    return (
                      <text
                        key={`inner-${letter}`}
                        x={coords.x}
                        y={coords.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`font-mono text-xs ${isMatchedInner ? "fill-amber-400 font-extrabold" : "fill-slate-600"}`}
                      >
                        {alphabet[shiftedIndex]}
                      </text>
                    );
                  })}

                  {/* Arrow highlighting the active mapping */}
                  {currentCaesarActiveIndex !== -1 && (
                    <>
                      {(() => {
                        const shift = cleanCaesarShift !== null ? cleanCaesarShift : 0;
                        const outerCoords = getCaesarWheelCoordinates(currentCaesarActiveIndex, 100);
                        const innerCoords = getCaesarWheelCoordinates(currentCaesarActiveIndex, 88);
                        return (
                          <line
                            x1={outerCoords.x}
                            y1={outerCoords.y}
                            x2={innerCoords.x}
                            y2={innerCoords.y}
                            stroke="#f59e0b"
                            strokeWidth="3"
                            markerEnd="url(#arrow)"
                          />
                        );
                      })()}
                    </>
                  )}
                </svg>
              </div>

              {/* Playback controls */}
              <div className="w-full mt-6 space-y-4">
                <div className="flex justify-center items-center space-x-3">
                  <button
                    data-testid="step-backward-btn-caesar"
                    onClick={() => {
                      setCaesarIsPlaying(false);
                      setCaesarIndex((prev) => (prev > 0 ? prev - 1 : caesarInput.length - 1));
                    }}
                    className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300"
                    aria-label="Step Backward"
                  >
                    ⏮
                  </button>
                  {caesarIsPlaying ? (
                    <button
                      data-testid="pause-btn-caesar"
                      onClick={() => setCaesarIsPlaying(false)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded"
                      aria-label="Pause"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      data-testid="play-btn-caesar"
                      onClick={() => setCaesarIsPlaying(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded"
                      aria-label="Play"
                    >
                      Play
                    </button>
                  )}
                  <button
                    data-testid="step-forward-btn-caesar"
                    onClick={() => {
                      setCaesarIsPlaying(false);
                      setCaesarIndex((prev) => (prev < caesarInput.length - 1 ? prev + 1 : 0));
                    }}
                    className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300"
                    aria-label="Step Forward"
                  >
                    ⏭
                  </button>
                  <button
                    data-testid="reset-btn-caesar"
                    onClick={() => {
                      setCaesarIsPlaying(false);
                      setCaesarIndex(0);
                      setCaesarInput("");
                      setCaesarOutput("");
                    }}
                    className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300"
                    aria-label="Reset"
                  >
                    🔄
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <label htmlFor="speed-caesar" className="text-xs font-mono text-slate-400">
                    Speed:
                  </label>
                  <input
                    id="speed-caesar"
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    data-testid="speed-slider-caesar"
                    className="flex-1 accent-amber-500"
                    value={caesarSpeed}
                    onChange={(e) => setCaesarSpeed(parseInt(e.target.value, 10))}
                  />
                  <span className="text-xs font-mono text-slate-400">{caesarSpeed}ms</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------
            VIGENERE CIPHER EXHIBIT
            ------------------------------------------------------------- */}
        <section
          id="vigenere"
          ref={sectionRefs.vigenere}
          data-testid="exhibit-vigenere"
          className="mb-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl"
        >
          <h3 className="text-3xl font-bold text-amber-400 mb-2">Vigenère Cipher</h3>
          <p className="text-slate-400 mb-6 font-serif">
            A polyalphabetic substitution cipher that shifts text letters using a keyword cycled repeatedly.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="input-vigenere" className="block text-sm font-mono text-slate-300 mb-2">
                  Input Text (Max 500 Chars)
                </label>
                <textarea
                  id="input-vigenere"
                  data-testid="input-text-vigenere"
                  className="w-full h-32 px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={vigenereInput}
                  onChange={(e) => setVigenereInput(e.target.value)}
                  maxLength={505}
                  placeholder="Enter secret message..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="key-vigenere" className="block text-sm font-mono text-slate-300 mb-2">
                    Keyword
                  </label>
                  <input
                    id="key-vigenere"
                    type="text"
                    data-testid="param-key-vigenere"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={vigenereKey}
                    onChange={(e) => setVigenereKey(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="mode-vigenere" className="block text-sm font-mono text-slate-300 mb-2">
                    Mode Select
                  </label>
                  <select
                    id="mode-vigenere"
                    data-testid="mode-select-vigenere"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={vigenereMode}
                    onChange={(e) => setVigenereMode(e.target.value as "encrypt" | "decrypt")}
                  >
                    <option value="encrypt">Encrypt</option>
                    <option value="decrypt">Decrypt</option>
                  </select>
                </div>
              </div>

              {/* Mode button triggers for Playwright tests */}
              <div className="flex space-x-2">
                <button
                  data-testid="encrypt-btn-vigenere"
                  onClick={() => setVigenereMode("encrypt")}
                  className={`flex-1 py-2 rounded font-mono text-sm border transition ${
                    vigenereMode === "encrypt" ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  Encrypt Mode
                </button>
                <button
                  data-testid="decrypt-btn-vigenere"
                  onClick={() => setVigenereMode("decrypt")}
                  className={`flex-1 py-2 rounded font-mono text-sm border transition ${
                    vigenereMode === "decrypt" ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  Decrypt Mode
                </button>
              </div>

              {vigenereError && (
                <div
                  data-testid="error-message-vigenere"
                  className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-red-200 text-sm font-mono"
                  role="alert"
                >
                  {vigenereError}
                </div>
              )}

              <div>
                <span className="block text-sm font-mono text-slate-300 mb-2">Output Text</span>
                <div
                  data-testid="output-text-vigenere"
                  className="w-full min-h-[50px] p-4 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-mono break-all whitespace-pre-wrap"
                >
                  {vigenereOutput}
                </div>
              </div>
            </div>

            {/* VIGENERE VISUALIZER */}
            <div className="flex flex-col justify-between items-center border border-slate-800 rounded-xl p-6 bg-slate-950/40 min-h-[450px]">
              <h4 className="text-lg font-bold text-slate-300 mb-4 font-serif">Vigenère Square (Tabula Recta)</h4>
              
              <div
                ref={vigenereGridRef}
                data-testid="visualizer-vigenere"
                className="w-full h-64 overflow-auto border border-slate-800 rounded bg-slate-950 p-2 scrollbar-thin scrollbar-thumb-slate-850"
              >
                <table className="table-auto border-collapse font-mono text-[10px] w-full text-center">
                  <thead>
                    <tr>
                      <th className="p-1 text-slate-500 font-bold bg-slate-950 border border-slate-900 sticky top-0 left-0 z-10 bg-slate-950"></th>
                      {alphabet.split("").map((letter, idx) => (
                        <th
                          key={`col-${letter}`}
                          className={`p-1 font-bold sticky top-0 bg-slate-950 border border-slate-900 transition-colors ${
                            idx === activeColIdx ? "text-amber-400 bg-slate-800" : "text-slate-400"
                          }`}
                        >
                          {letter}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alphabet.split("").map((rowLetter, rowIdx) => (
                      <tr key={`row-tr-${rowLetter}`}>
                        <td
                          className={`p-1 font-bold sticky left-0 bg-slate-950 border border-slate-900 transition-colors ${
                            rowIdx === activeRowIdx ? "text-amber-400 bg-slate-800" : "text-slate-400"
                          }`}
                        >
                          {rowLetter}
                        </td>
                        {alphabet.split("").map((colLetter, colIdx) => {
                          const cellLetterIdx = (rowIdx + colIdx) % 26;
                          const cellLetter = alphabet[cellLetterIdx];
                          const isIntersection = rowIdx === activeRowIdx && colIdx === activeColIdx;
                          const isHighlighted = rowIdx === activeRowIdx || colIdx === activeColIdx;

                          return (
                            <td
                              id={`vig-cell-${rowIdx}-${colIdx}`}
                              key={`cell-${rowIdx}-${colIdx}`}
                              className={`p-1 border border-slate-900 transition-colors ${
                                isIntersection
                                  ? "bg-amber-400 text-slate-950 font-bold scale-110 ring-2 ring-amber-500 z-10"
                                  : isHighlighted
                                  ? "bg-slate-900/60 text-slate-300"
                                  : "text-slate-600"
                              }`}
                            >
                              {cellLetter}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Playback controls */}
              <div className="w-full mt-6 space-y-4">
                <div className="flex justify-center items-center space-x-3">
                  <button
                    data-testid="step-backward-btn-vigenere"
                    onClick={() => {
                      setVigenereIsPlaying(false);
                      setVigenereIndex((prev) => (prev > 0 ? prev - 1 : vigenereInput.length - 1));
                    }}
                    className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300"
                    aria-label="Step Backward"
                  >
                    ⏮
                  </button>
                  {vigenereIsPlaying ? (
                    <button
                      data-testid="pause-btn-vigenere"
                      onClick={() => setVigenereIsPlaying(false)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded"
                      aria-label="Pause"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      data-testid="play-btn-vigenere"
                      onClick={() => setVigenereIsPlaying(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded"
                      aria-label="Play"
                    >
                      Play
                    </button>
                  )}
                  <button
                    data-testid="step-forward-btn-vigenere"
                    onClick={() => {
                      setVigenereIsPlaying(false);
                      setVigenereIndex((prev) => (prev < vigenereInput.length - 1 ? prev + 1 : 0));
                    }}
                    className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300"
                    aria-label="Step Forward"
                  >
                    ⏭
                  </button>
                  <button
                    data-testid="reset-btn-vigenere"
                    onClick={() => {
                      setVigenereIsPlaying(false);
                      setVigenereIndex(0);
                    }}
                    className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300"
                    aria-label="Reset"
                  >
                    🔄
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <label htmlFor="speed-vigenere" className="text-xs font-mono text-slate-400">
                    Speed:
                  </label>
                  <input
                    id="speed-vigenere"
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    data-testid="speed-slider-vigenere"
                    className="flex-1 accent-amber-500"
                    value={vigenereSpeed}
                    onChange={(e) => setVigenereSpeed(parseInt(e.target.value, 10))}
                  />
                  <span className="text-xs font-mono text-slate-400">{vigenereSpeed}ms</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------
            AFFINE CIPHER EXHIBIT
            ------------------------------------------------------------- */}
        <section
          id="affine"
          ref={sectionRefs.affine}
          data-testid="exhibit-affine"
          className="mb-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl"
        >
          <h3 className="text-3xl font-bold text-amber-400 mb-2">Affine Cipher</h3>
          <p className="text-slate-400 mb-6 font-serif">
            A mathematical substitution cipher where each letter is mapped to its numeric equivalent, encrypted via the formula: E(x) = (ax + b) mod 26.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="input-affine" className="block text-sm font-mono text-slate-300 mb-2">
                  Input Text (Max 500 Chars)
                </label>
                <textarea
                  id="input-affine"
                  data-testid="input-text-affine"
                  className="w-full h-32 px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={affineInput}
                  onChange={(e) => setAffineInput(e.target.value)}
                  maxLength={505}
                  placeholder="Enter secret message..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="param-a-affine" className="block text-sm font-mono text-slate-300 mb-2">
                    Key a
                  </label>
                  <input
                    id="param-a-affine"
                    type="text"
                    data-testid="param-a-affine"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={affineA}
                    onChange={(e) => setAffineA(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="param-b-affine" className="block text-sm font-mono text-slate-300 mb-2">
                    Key b
                  </label>
                  <input
                    id="param-b-affine"
                    type="text"
                    data-testid="param-b-affine"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={affineB}
                    onChange={(e) => setAffineB(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="mode-affine" className="block text-sm font-mono text-slate-300 mb-2">
                    Mode Select
                  </label>
                  <select
                    id="mode-affine"
                    data-testid="mode-select-affine"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={affineMode}
                    onChange={(e) => setAffineMode(e.target.value as "encrypt" | "decrypt")}
                  >
                    <option value="encrypt">Encrypt</option>
                    <option value="decrypt">Decrypt</option>
                  </select>
                </div>
              </div>

              {/* Mode button triggers for Playwright tests */}
              <div className="flex space-x-2">
                <button
                  data-testid="encrypt-btn-affine"
                  onClick={() => setAffineMode("encrypt")}
                  className={`flex-1 py-2 rounded font-mono text-sm border transition ${
                    affineMode === "encrypt" ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  Encrypt Mode
                </button>
                <button
                  data-testid="decrypt-btn-affine"
                  onClick={() => setAffineMode("decrypt")}
                  className={`flex-1 py-2 rounded font-mono text-sm border transition ${
                    affineMode === "decrypt" ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  Decrypt Mode
                </button>
              </div>

              {affineError && (
                <div
                  data-testid="error-message-affine"
                  className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-red-200 text-sm font-mono"
                  role="alert"
                >
                  {affineError}
                </div>
              )}

              <div>
                <span className="block text-sm font-mono text-slate-300 mb-2">Output Text</span>
                <div
                  data-testid="output-text-affine"
                  className="w-full min-h-[50px] p-4 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-mono break-all whitespace-pre-wrap"
                >
                  {affineOutput}
                </div>
              </div>
            </div>

            {/* AFFINE VISUALIZER */}
            <div className="flex flex-col justify-between items-center border border-slate-800 rounded-xl p-6 bg-slate-950/40">
              <h4 className="text-lg font-bold text-slate-300 mb-4 font-serif">Mathematical Formula Visualizer</h4>

              <div
                data-testid="visualizer-affine"
                className="w-full text-center py-4 bg-slate-950 border border-slate-900 rounded-lg font-mono text-sm text-slate-200"
              >
                {affineMode === "encrypt" ? (
                  <div>
                    E(x) = ({affineA}x + {affineB}) mod 26
                    {currentAffineActiveIndex !== -1 && (
                      <div className="text-xs text-amber-400 mt-2">
                        E({currentAffineActiveIndex}) = ({affineA} × {currentAffineActiveIndex} + {affineB}) mod 26 = {computedAffineMappedIndex}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    D(y) = a⁻¹(y - {affineB}) mod 26
                    {currentAffineActiveIndex !== -1 && (
                      <div className="text-xs text-amber-400 mt-2">
                        D({currentAffineActiveIndex}) = {affineA}⁻¹({currentAffineActiveIndex} - {affineB}) mod 26 = {computedAffineMappedIndex}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Number line mapping SVG */}
              <div className="w-full h-40 relative mt-4 overflow-x-auto overflow-y-hidden">
                <svg width="600" height="150" className="mx-auto" aria-hidden="true">
                  {/* Definition of Arrowhead */}
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                    </marker>
                  </defs>

                  {/* Top Line: Plaintext Indices */}
                  <line x1="10" y1="30" x2="590" y2="30" stroke="#475569" strokeWidth="2" />
                  {/* Bottom Line: Ciphertext Indices */}
                  <line x1="10" y1="120" x2="590" y2="120" stroke="#475569" strokeWidth="2" />

                  {alphabet.split("").map((letter, idx) => {
                    const x = 20 + idx * 22;
                    const isPlainActive = idx === currentAffineActiveIndex;
                    const isCipherActive = idx === computedAffineMappedIndex;

                    return (
                      <g key={`num-line-${idx}`}>
                        {/* Plaintext letter node */}
                        <circle
                          cx={x}
                          cy="30"
                          r="8"
                          className={`${isPlainActive ? "fill-amber-400 stroke-amber-500" : "fill-slate-800 stroke-slate-700"}`}
                          strokeWidth="1.5"
                        />
                        <text
                          x={x}
                          y="30"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="font-mono text-[8px] fill-slate-300"
                        >
                          {letter}
                        </text>

                        {/* Ciphertext letter node */}
                        <circle
                          cx={x}
                          cy="120"
                          r="8"
                          className={`${isCipherActive ? "fill-amber-500 stroke-amber-600" : "fill-slate-800 stroke-slate-700"}`}
                          strokeWidth="1.5"
                        />
                        <text
                          x={x}
                          y="120"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="font-mono text-[8px] fill-slate-300"
                        >
                          {letter.toLowerCase()}
                        </text>

                        {/* Connection arrow when active */}
                        {isPlainActive && computedAffineMappedIndex !== -1 && (
                          <line
                            x1={x}
                            y1={38}
                            x2={20 + computedAffineMappedIndex * 22}
                            y2={110}
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                            markerEnd="url(#arrow)"
                            className="transition-all"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Playback controls */}
              <div className="w-full mt-6 space-y-4">
                <div className="flex justify-center items-center space-x-3">
                  <button
                    data-testid="step-backward-btn-affine"
                    onClick={() => {
                      setAffineIsPlaying(false);
                      setAffineIndex((prev) => (prev > 0 ? prev - 1 : affineInput.length - 1));
                    }}
                    className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300"
                    aria-label="Step Backward"
                  >
                    ⏮
                  </button>
                  {affineIsPlaying ? (
                    <button
                      data-testid="pause-btn-affine"
                      onClick={() => setAffineIsPlaying(false)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded"
                      aria-label="Pause"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      data-testid="play-btn-affine"
                      onClick={() => setAffineIsPlaying(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded"
                      aria-label="Play"
                    >
                      Play
                    </button>
                  )}
                  <button
                    data-testid="step-forward-btn-affine"
                    onClick={() => {
                      setAffineIsPlaying(false);
                      setAffineIndex((prev) => (prev < affineInput.length - 1 ? prev + 1 : 0));
                    }}
                    className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300"
                    aria-label="Step Forward"
                  >
                    ⏭
                  </button>
                  <button
                    data-testid="reset-btn-affine"
                    onClick={() => {
                      setAffineIsPlaying(false);
                      setAffineIndex(0);
                    }}
                    className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-300"
                    aria-label="Reset"
                  >
                    🔄
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <label htmlFor="speed-affine" className="text-xs font-mono text-slate-400">
                    Speed:
                  </label>
                  <input
                    id="speed-affine"
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    data-testid="speed-slider-affine"
                    className="flex-1 accent-amber-500"
                    value={affineSpeed}
                    onChange={(e) => setAffineSpeed(parseInt(e.target.value, 10))}
                  />
                  <span className="text-xs font-mono text-slate-400">{affineSpeed}ms</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------
            SKELETON PLACEHOLDERS FOR REMAINING CIPHERS
            ------------------------------------------------------------- */}
        <section
          id="scytale"
          ref={sectionRefs.scytale}
          data-testid="exhibit-scytale"
          className="mb-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl"
        >
          <h3 className="text-3xl font-bold text-amber-400 mb-2">Scytale Cipher</h3>
          <p className="text-slate-400 mb-6 font-serif">
            A transposition cipher used by the ancient Greeks, consisting of a cylinder with a strip of parchment wrapped around it.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="input-scytale" className="block text-sm font-mono text-slate-300 mb-2">
                  Input Text (Max 500 Chars)
                </label>
                <textarea
                  id="input-scytale"
                  data-testid="input-text-scytale"
                  className="w-full h-32 px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={scytaleInput}
                  onChange={(e) => setScytaleInput(e.target.value)}
                  maxLength={505}
                  placeholder="Enter secret message..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="width-scytale" className="block text-sm font-mono text-slate-300 mb-2">
                    Cylinder Width (Diameter)
                  </label>
                  <input
                    id="width-scytale"
                    type="text"
                    data-testid="param-width-scytale"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={scytaleWidth}
                    onChange={(e) => setScytaleWidth(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-slate-300 mb-2">
                    Action
                  </label>
                  <div className="flex space-x-2">
                    <button
                      data-testid="encrypt-btn-scytale"
                      onClick={() => setScytaleMode("encrypt")}
                      className={`flex-1 py-2 rounded-lg font-mono text-xs border transition ${
                        scytaleMode === "encrypt"
                          ? "bg-amber-500 border-amber-500 text-slate-950 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                      }`}
                    >
                      Encrypt
                    </button>
                    <button
                      data-testid="decrypt-btn-scytale"
                      onClick={() => setScytaleMode("decrypt")}
                      className={`flex-1 py-2 rounded-lg font-mono text-xs border transition ${
                        scytaleMode === "decrypt"
                          ? "bg-amber-500 border-amber-500 text-slate-950 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                      }`}
                    >
                      Decrypt
                    </button>
                  </div>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Step: {scytaleIndex + 1} / {Math.max(1, scytaleInput.length)}</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      data-testid="step-backward-btn-scytale"
                      onClick={() => setScytaleIndex((prev) => Math.max(0, prev - 1))}
                      disabled={scytaleIndex === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Backward"
                    >
                      ⏮️
                    </button>
                    {scytaleIsPlaying ? (
                      <button
                        type="button"
                        data-testid="pause-btn-scytale"
                        onClick={() => setScytaleIsPlaying(false)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Pause"
                      >
                        ⏸️
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-testid="play-btn-scytale"
                        onClick={() => setScytaleIsPlaying(true)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Play"
                      >
                        ▶️
                      </button>
                    )}
                    <button
                      type="button"
                      data-testid="step-forward-btn-scytale"
                      onClick={() => setScytaleIndex((prev) => Math.min(scytaleInput.length - 1, prev + 1))}
                      disabled={scytaleIndex >= scytaleInput.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Forward"
                    >
                      ⏭️
                    </button>
                    <button
                      type="button"
                      data-testid="reset-btn-scytale"
                      onClick={() => {
                        setScytaleIsPlaying(false);
                        setScytaleIndex(0);
                      }}
                      className="p-1 text-slate-400 hover:text-white transition"
                      aria-label="Reset"
                    >
                      🔄
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label htmlFor="speed-scytale" className="text-xs font-mono text-slate-400">Speed</label>
                  <input
                    id="speed-scytale"
                    type="range"
                    data-testid="speed-slider-scytale"
                    min="100"
                    max="2000"
                    step="100"
                    value={scytaleSpeed}
                    onChange={(e) => setScytaleSpeed(parseInt(e.target.value, 10))}
                    className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400">{scytaleSpeed}ms</span>
                </div>
              </div>

              {scytaleError && (
                <div
                  data-testid="error-message-scytale"
                  className="p-3 bg-red-950/80 border border-red-900 text-red-400 rounded-lg text-sm font-mono"
                >
                  {scytaleError}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div data-testid="visualizer-scytale" className="relative">
                {/* SVG Cylinder */}
                <svg viewBox="0 0 400 240" className="w-full h-60 bg-slate-950 rounded-lg border border-slate-800">
                  <defs>
                    <linearGradient id="cylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="50%" stopColor="#475569" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                  </defs>
                  
                  {/* Cylinder Body */}
                  <rect x="120" y="10" width="160" height="220" rx="15" fill="url(#cylinderGrad)" stroke="#64748b" strokeWidth="2" />
                  
                  {/* Diagonal tape wraps */}
                  {Array.from({ length: Math.min(Math.ceil((scytaleInput.length || 8) / (cleanScytaleWidth || 4)), 8) }).map((_, rIdx) => (
                    <path
                      key={`ribbon-${rIdx}`}
                      d={`M 120 ${30 + rIdx * 25} L 280 ${45 + rIdx * 25} L 280 ${65 + rIdx * 25} L 120 ${50 + rIdx * 25} Z`}
                      fill="#b45309"
                      fillOpacity="0.4"
                      stroke="#d97706"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Letters on the tape */}
                  {scytaleInput.split("").slice(0, 32).map((char, charIdx) => {
                    const scytaleWidthVal = cleanScytaleWidth || 4;
                    const col = charIdx % scytaleWidthVal;
                    const row = Math.floor(charIdx / scytaleWidthVal);
                    const x = 140 + (col / Math.max(1, scytaleWidthVal - 1)) * 120;
                    const y = 42 + row * 25;
                    const isActive = charIdx === scytaleIndex;
                    return (
                      <g key={`scytale-char-${charIdx}`}>
                        {isActive && (
                          <circle cx={x} cy={y} r="12" fill="#f59e0b" className="animate-pulse" />
                        )}
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className={`font-mono font-bold text-xs ${isActive ? "fill-slate-950" : "fill-amber-400"}`}
                        >
                          {char === " " ? "_" : char}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div>
                <span className="block text-sm font-mono text-slate-300 mb-2">
                  Output Text
                </span>
                <div
                  data-testid="output-text-scytale"
                  className="w-full min-h-[80px] p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-amber-500 text-sm whitespace-pre-wrap break-all"
                >
                  {scytaleOutput}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="polybius"
          ref={sectionRefs.polybius}
          data-testid="exhibit-polybius"
          className="mb-16 bg-slate-900 border border-slate-850 rounded-2xl p-8 shadow-xl"
        >
          <h3 className="text-3xl font-bold text-amber-400 mb-2">Polybius Square</h3>
          <p className="text-slate-400 mb-6 font-serif">
            A device invented by the ancient Greeks for fractionating letters into grid coordinates (1-5 for rows and columns).
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="input-polybius" className="block text-sm font-mono text-slate-300 mb-2">
                  Input Text (Max 500 Chars)
                </label>
                <textarea
                  id="input-polybius"
                  data-testid="input-text-polybius"
                  className="w-full h-32 px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={polybiusInput}
                  onChange={(e) => setPolybiusInput(e.target.value)}
                  maxLength={505}
                  placeholder="Enter message (letters for encrypt, coordinate pairs for decrypt)..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="key-polybius" className="block text-sm font-mono text-slate-300 mb-2">
                    Grid Key (25 letters)
                  </label>
                  <input
                    id="key-polybius"
                    type="text"
                    data-testid="param-key-polybius"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={polybiusKey}
                    onChange={(e) => setPolybiusKey(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-slate-300 mb-2">
                    Action
                  </label>
                  <div className="flex space-x-2">
                    <button
                      data-testid="encrypt-btn-polybius"
                      onClick={() => setPolybiusMode("encrypt")}
                      className={`flex-1 py-2 rounded-lg font-mono text-xs border transition ${
                        polybiusMode === "encrypt"
                          ? "bg-amber-500 border-amber-500 text-slate-950 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                      }`}
                    >
                      Encrypt
                    </button>
                    <button
                      data-testid="decrypt-btn-polybius"
                      onClick={() => setPolybiusMode("decrypt")}
                      className={`flex-1 py-2 rounded-lg font-mono text-xs border transition ${
                        polybiusMode === "decrypt"
                          ? "bg-amber-500 border-amber-500 text-slate-950 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                      }`}
                    >
                      Decrypt
                    </button>
                  </div>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Step: {polybiusIndex + 1} / {Math.max(1, polybiusInput.length)}</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      data-testid="step-backward-btn-polybius"
                      onClick={() => setPolybiusIndex((prev) => Math.max(0, prev - 1))}
                      disabled={polybiusIndex === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Backward"
                    >
                      ⏮️
                    </button>
                    {polybiusIsPlaying ? (
                      <button
                        type="button"
                        data-testid="pause-btn-polybius"
                        onClick={() => setPolybiusIsPlaying(false)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Pause"
                      >
                        ⏸️
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-testid="play-btn-polybius"
                        onClick={() => setPolybiusIsPlaying(true)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Play"
                      >
                        ▶️
                      </button>
                    )}
                    <button
                      type="button"
                      data-testid="step-forward-btn-polybius"
                      onClick={() => setPolybiusIndex((prev) => Math.min(polybiusInput.length - 1, prev + 1))}
                      disabled={polybiusIndex >= polybiusInput.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Forward"
                    >
                      ⏭️
                    </button>
                    <button
                      type="button"
                      data-testid="reset-btn-polybius"
                      onClick={() => {
                        setPolybiusIsPlaying(false);
                        setPolybiusIndex(0);
                      }}
                      className="p-1 text-slate-400 hover:text-white transition"
                      aria-label="Reset"
                    >
                      🔄
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label htmlFor="speed-polybius" className="text-xs font-mono text-slate-400">Speed</label>
                  <input
                    id="speed-polybius"
                    type="range"
                    data-testid="speed-slider-polybius"
                    min="100"
                    max="2000"
                    step="100"
                    value={polybiusSpeed}
                    onChange={(e) => setPolybiusSpeed(parseInt(e.target.value, 10))}
                    className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400">{polybiusSpeed}ms</span>
                </div>
              </div>

              {polybiusError && (
                <div
                  data-testid="error-message-polybius"
                  className="p-3 bg-red-950/80 border border-red-900 text-red-400 rounded-lg text-sm font-mono"
                >
                  {polybiusError}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div data-testid="visualizer-polybius" className="flex justify-center p-2 bg-slate-950 rounded-lg border border-slate-800">
                <table className="border-collapse border border-slate-800 bg-slate-900/60 font-mono text-sm">
                  <thead>
                    <tr>
                      <th className="p-2 border border-slate-800 bg-slate-950 text-slate-500"></th>
                      {[1, 2, 3, 4, 5].map((col) => (
                        <th
                          key={`col-hdr-${col}`}
                          className={`p-2 border border-slate-800 bg-slate-950 ${col === polybiusActiveCoords.col ? "text-amber-400 font-bold" : "text-slate-500"}`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((row) => (
                      <tr key={`row-${row}`}>
                        <th
                          className={`p-2 border border-slate-800 bg-slate-950 ${row === polybiusActiveCoords.row ? "text-amber-400 font-bold" : "text-slate-500"}`}
                        >
                          {row}
                        </th>
                        {[1, 2, 3, 4, 5].map((col) => {
                          const cellIndex = (row - 1) * 5 + (col - 1);
                          const letter = cleanPolybiusKey[cellIndex] || "";
                          const isRowMatch = row === polybiusActiveCoords.row;
                          const isColMatch = col === polybiusActiveCoords.col;
                          const isIntersect = isRowMatch && isColMatch;
                          return (
                            <td
                              key={`cell-${row}-${col}`}
                              className={`p-3 border border-slate-800 text-center transition ${
                                isIntersect
                                  ? "bg-amber-500 text-slate-950 font-extrabold scale-105 shadow-lg"
                                  : isRowMatch || isColMatch
                                  ? "bg-slate-800 text-amber-300"
                                  : "text-slate-500"
                              }`}
                            >
                              {letter.toUpperCase()}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <span className="block text-sm font-mono text-slate-300 mb-2">
                  Output Text
                </span>
                <div
                  data-testid="output-text-polybius"
                  className="w-full min-h-[80px] p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-amber-500 text-sm whitespace-pre-wrap break-all"
                >
                  {polybiusOutput}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="enigma"
          ref={sectionRefs.enigma}
          data-testid="exhibit-enigma"
          className="mb-16 bg-slate-900 border border-slate-850 rounded-2xl p-8 shadow-xl"
        >
          <h3 className="text-3xl font-bold text-amber-400 mb-2">Enigma Machine</h3>
          <p className="text-slate-400 mb-6 font-serif">
            The legendary electro-mechanical rotor cipher machine used in WWII, featuring configurable rotors, ring settings, and plugboard connections.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="input-enigma" className="block text-sm font-mono text-slate-300 mb-2">
                  Input Text (Max 500 Chars)
                </label>
                <textarea
                  id="input-enigma"
                  data-testid="input-text-enigma"
                  className="w-full h-24 px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  value={enigmaInput}
                  onChange={(e) => setEnigmaInput(e.target.value)}
                  maxLength={505}
                  placeholder="Enter message to encipher (A-Z only)..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rotors-enigma" className="block text-xs font-mono text-slate-300 mb-1">
                    Rotors (e.g. I-II-III)
                  </label>
                  <input
                    id="rotors-enigma"
                    type="text"
                    data-testid="param-rotors-enigma"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                    value={enigmaRotors}
                    onChange={(e) => setEnigmaRotors(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="positions-enigma" className="block text-xs font-mono text-slate-300 mb-1">
                    Initial Positions (e.g. A-A-A)
                  </label>
                  <input
                    id="positions-enigma"
                    type="text"
                    data-testid="param-positions-enigma"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                    value={enigmaPositions}
                    onChange={(e) => setEnigmaPositions(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rings-enigma" className="block text-xs font-mono text-slate-300 mb-1">
                    Ring Settings (e.g. A-A-A or 1-1-1)
                  </label>
                  <input
                    id="rings-enigma"
                    type="text"
                    data-testid="param-rings-enigma"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                    value={enigmaRings}
                    onChange={(e) => setEnigmaRings(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="plugboard-enigma" className="block text-xs font-mono text-slate-300 mb-1">
                    Plugboard Swaps (e.g. AB CD)
                  </label>
                  <input
                    id="plugboard-enigma"
                    type="text"
                    data-testid="param-plugboard-enigma"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                    value={enigmaPlugboard}
                    onChange={(e) => setEnigmaPlugboard(e.target.value)}
                  />
                </div>
              </div>

              <button
                data-testid="encrypt-btn-enigma"
                onClick={handleEnigmaProcess}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg font-mono text-sm transition"
              >
                Encipher Message
              </button>

              {/* Playback Controls */}
              <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Step: {enigmaIndex + 1} / {Math.max(1, enigmaInput.length)}</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      data-testid="step-backward-btn-enigma"
                      onClick={() => setEnigmaIndex((prev) => Math.max(0, prev - 1))}
                      disabled={enigmaIndex === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Backward"
                    >
                      ⏮️
                    </button>
                    {enigmaIsPlaying ? (
                      <button
                        type="button"
                        data-testid="pause-btn-enigma"
                        onClick={() => setEnigmaIsPlaying(false)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Pause"
                      >
                        ⏸️
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-testid="play-btn-enigma"
                        onClick={() => setEnigmaIsPlaying(true)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Play"
                      >
                        ▶️
                      </button>
                    )}
                    <button
                      type="button"
                      data-testid="step-forward-btn-enigma"
                      onClick={() => setEnigmaIndex((prev) => Math.min(enigmaInput.length - 1, prev + 1))}
                      disabled={enigmaIndex >= enigmaInput.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Forward"
                    >
                      ⏭️
                    </button>
                    <button
                      type="button"
                      data-testid="reset-btn-enigma"
                      onClick={() => {
                        setEnigmaIsPlaying(false);
                        setEnigmaIndex(0);
                      }}
                      className="p-1 text-slate-400 hover:text-white transition"
                      aria-label="Reset"
                    >
                      🔄
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label htmlFor="speed-enigma" className="text-xs font-mono text-slate-400">Speed</label>
                  <input
                    id="speed-enigma"
                    type="range"
                    data-testid="speed-slider-enigma"
                    min="100"
                    max="2000"
                    step="100"
                    value={enigmaSpeed}
                    onChange={(e) => setEnigmaSpeed(parseInt(e.target.value, 10))}
                    className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400">{enigmaSpeed}ms</span>
                </div>
              </div>

              {enigmaError && (
                <div
                  data-testid="error-message-enigma"
                  className="p-3 bg-red-950/80 border border-red-900 text-red-400 rounded-lg text-sm font-mono"
                >
                  {enigmaError}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div data-testid="visualizer-enigma" className="relative">
                {/* SVG Enigma Electrical Path */}
                <svg viewBox="0 0 400 240" className="w-full h-60 bg-slate-950 rounded-lg border border-slate-800">
                  {/* Column Labels */}
                  <text x="30" y="20" textAnchor="middle" className="fill-slate-500 font-mono text-[9px] font-bold">REFL</text>
                  <text x="115" y="20" textAnchor="middle" className="fill-slate-500 font-mono text-[9px] font-bold">
                    ROTOR 1 ({getRotorPositionsAtStep(enigmaPositions.split("-"), enigmaIndex)[0] || "A"})
                  </text>
                  <text x="195" y="20" textAnchor="middle" className="fill-slate-500 font-mono text-[9px] font-bold">
                    ROTOR 2 ({getRotorPositionsAtStep(enigmaPositions.split("-"), enigmaIndex)[1] || "A"})
                  </text>
                  <text x="275" y="20" textAnchor="middle" className="fill-slate-500 font-mono text-[9px] font-bold">
                    ROTOR 3 ({getRotorPositionsAtStep(enigmaPositions.split("-"), enigmaIndex)[2] || "A"})
                  </text>
                  <text x="360" y="20" textAnchor="middle" className="fill-slate-500 font-mono text-[9px] font-bold">PLUG/KB</text>

                  {/* Render 26 light dots/guides for each column */}
                  {Array.from({ length: 26 }).map((_, idx) => {
                    const y = 30 + idx * 7.6;
                    return (
                      <g key={`dots-${idx}`} opacity="0.15">
                        <circle cx="30" cy={y} r="1.5" fill="#94a3b8" />
                        <circle cx="110" cy={y} r="1.5" fill="#94a3b8" />
                        <circle cx="120" cy={y} r="1.5" fill="#94a3b8" />
                        <circle cx="190" cy={y} r="1.5" fill="#94a3b8" />
                        <circle cx="200" cy={y} r="1.5" fill="#94a3b8" />
                        <circle cx="270" cy={y} r="1.5" fill="#94a3b8" />
                        <circle cx="280" cy={y} r="1.5" fill="#94a3b8" />
                        <circle cx="360" cy={y} r="1.5" fill="#94a3b8" />
                      </g>
                    );
                  })}

                  {/* Traversal Electrical Line */}
                  {enigmaVisualPath && (
                    <g>
                      {/* Keyboard -> Plugboard In */}
                      <line
                        x1="360"
                        y1={30 + enigmaVisualPath.keyboard * 7.6}
                        x2="360"
                        y2={30 + enigmaVisualPath.pbIn * 7.6}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="2,2"
                      />
                      
                      {/* Plugboard In -> Rotor 3 In */}
                      <line
                        x1="360"
                        y1={30 + enigmaVisualPath.pbIn * 7.6}
                        x2="280"
                        y2={30 + enigmaVisualPath.pbIn * 7.6}
                        stroke="#10b981"
                        strokeWidth="2"
                      />

                      {/* Rotor 3 In -> Rotor 3 Out */}
                      <line
                        x1="280"
                        y1={30 + enigmaVisualPath.pbIn * 7.6}
                        x2="270"
                        y2={30 + enigmaVisualPath.r3Out * 7.6}
                        stroke="#10b981"
                        strokeWidth="2"
                      />

                      {/* Rotor 3 Out -> Rotor 2 In */}
                      <line
                        x1="270"
                        y1={30 + enigmaVisualPath.r3Out * 7.6}
                        x2="200"
                        y2={30 + enigmaVisualPath.r3Out * 7.6}
                        stroke="#10b981"
                        strokeWidth="2"
                      />

                      {/* Rotor 2 In -> Rotor 2 Out */}
                      <line
                        x1="200"
                        y1={30 + enigmaVisualPath.r3Out * 7.6}
                        x2="190"
                        y2={30 + enigmaVisualPath.r2Out * 7.6}
                        stroke="#10b981"
                        strokeWidth="2"
                      />

                      {/* Rotor 2 Out -> Rotor 1 In */}
                      <line
                        x1="190"
                        y1={30 + enigmaVisualPath.r2Out * 7.6}
                        x2="120"
                        y2={30 + enigmaVisualPath.r2Out * 7.6}
                        stroke="#10b981"
                        strokeWidth="2"
                      />

                      {/* Rotor 1 In -> Rotor 1 Out */}
                      <line
                        x1="120"
                        y1={30 + enigmaVisualPath.r2Out * 7.6}
                        x2="110"
                        y2={30 + enigmaVisualPath.r1Out * 7.6}
                        stroke="#10b981"
                        strokeWidth="2"
                      />

                      {/* Rotor 1 Out -> Reflector */}
                      <line
                        x1="110"
                        y1={30 + enigmaVisualPath.r1Out * 7.6}
                        x2="30"
                        y2={30 + enigmaVisualPath.refOut * 7.6}
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                      />

                      {/* Reflector -> Rotor 1 Out Back */}
                      <line
                        x1="30"
                        y1={30 + enigmaVisualPath.refOut * 7.6}
                        x2="110"
                        y2={30 + enigmaVisualPath.r1OutB * 7.6}
                        stroke="#ef4444"
                        strokeWidth="2"
                      />

                      {/* Rotor 1 Out Back -> Rotor 2 Out Back */}
                      <line
                        x1="110"
                        y1={30 + enigmaVisualPath.r1OutB * 7.6}
                        x2="120"
                        y2={30 + enigmaVisualPath.r1OutB * 7.6}
                        stroke="#ef4444"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="120"
                        y1={30 + enigmaVisualPath.r1OutB * 7.6}
                        x2="190"
                        y2={30 + enigmaVisualPath.r1OutB * 7.6}
                        stroke="#ef4444"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="190"
                        y1={30 + enigmaVisualPath.r1OutB * 7.6}
                        x2="200"
                        y2={30 + enigmaVisualPath.r2OutB * 7.6}
                        stroke="#ef4444"
                        strokeWidth="2"
                      />

                      {/* Rotor 2 Out Back -> Rotor 3 Out Back */}
                      <line
                        x1="200"
                        y1={30 + enigmaVisualPath.r2OutB * 7.6}
                        x2="270"
                        y2={30 + enigmaVisualPath.r2OutB * 7.6}
                        stroke="#ef4444"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="270"
                        y1={30 + enigmaVisualPath.r2OutB * 7.6}
                        x2="280"
                        y2={30 + enigmaVisualPath.r3OutB * 7.6}
                        stroke="#ef4444"
                        strokeWidth="2"
                      />

                      {/* Rotor 3 Out Back -> Plugboard Out */}
                      <line
                        x1="280"
                        y1={30 + enigmaVisualPath.r3OutB * 7.6}
                        x2="360"
                        y2={30 + enigmaVisualPath.r3OutB * 7.6}
                        stroke="#ef4444"
                        strokeWidth="2"
                      />

                      {/* Plugboard Out -> Keyboard Output */}
                      <line
                        x1="360"
                        y1={30 + enigmaVisualPath.r3OutB * 7.6}
                        x2="360"
                        y2={30 + enigmaVisualPath.pbOut * 7.6}
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeDasharray="2,2"
                      />

                      {/* Glowing intersections */}
                      <circle cx="360" cy={30 + enigmaVisualPath.keyboard * 7.6} r="4.5" fill="#10b981" />
                      <circle cx="30" cy={30 + enigmaVisualPath.refOut * 7.6} r="5" fill="#f59e0b" />
                      <circle cx="360" cy={30 + enigmaVisualPath.pbOut * 7.6} r="4.5" fill="#ef4444" />
                    </g>
                  )}
                </svg>
              </div>

              <div>
                <span className="block text-sm font-mono text-slate-300 mb-2">
                  Output Text
                </span>
                <div
                  data-testid="output-text-enigma"
                  className="w-full min-h-[80px] p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-amber-500 text-sm whitespace-pre-wrap break-all"
                >
                  {enigmaOutput}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="aes"
          ref={sectionRefs.aes}
          data-testid="exhibit-aes"
          className="mb-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 opacity-90 hover:opacity-100 transition"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h3 className="text-3xl font-bold text-amber-400 mb-2 font-serif">AES Cipher</h3>
              <p className="text-sm text-slate-400 font-mono">
                Advanced Encryption Standard (AES-256 CTR Mode)
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <select
                data-testid="mode-select-aes"
                value={aesMode}
                onChange={(e) => setAesMode(e.target.value as "encrypt" | "decrypt")}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-amber-400 focus:border-amber-500 outline-none"
              >
                <option value="encrypt">Encrypt Mode</option>
                <option value="decrypt">Decrypt Mode</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="input-aes" className="block text-sm font-mono text-slate-300 mb-2">
                  Input String
                </label>
                <textarea
                  id="input-aes"
                  data-testid="input-text-aes"
                  value={aesInput}
                  onChange={(e) => setAesInput(e.target.value)}
                  className="w-full h-24 p-3 bg-slate-955 border border-slate-800 rounded-lg font-mono text-sm text-slate-200 focus:border-amber-500 outline-none"
                  placeholder="Enter text or hex to encrypt/decrypt..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="format-aes" className="block text-xs font-mono text-slate-400 mb-1">
                    Input Format
                  </label>
                  <select
                    id="format-aes"
                    data-testid="param-format-aes"
                    value={aesFormat}
                    onChange={(e) => setAesFormat(e.target.value as "text" | "hex")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-slate-300 focus:border-amber-500 outline-none"
                  >
                    <option value="text">Plain Text</option>
                    <option value="hex">Hexadecimal</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="keyformat-aes" className="block text-xs font-mono text-slate-400 mb-1">
                    Key Format
                  </label>
                  <select
                    id="keyformat-aes"
                    data-testid="param-keyformat-aes"
                    value={aesKeyFormat}
                    onChange={(e) => setAesKeyFormat(e.target.value as "text" | "hex")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-slate-300 focus:border-amber-500 outline-none"
                  >
                    <option value="text">Plain Text</option>
                    <option value="hex">Hexadecimal</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="key-aes" className="block text-sm font-mono text-slate-300 mb-2">
                  Cipher Key (16 or 32 bytes)
                </label>
                <input
                  id="key-aes"
                  type="text"
                  data-testid="param-key-aes"
                  value={aesKey}
                  onChange={(e) => setAesKey(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-sm text-slate-200 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  data-testid="encrypt-btn-aes"
                  onClick={() => {
                    setAesMode("encrypt");
                    handleAesProcess("encrypt");
                  }}
                  className={`flex-1 py-3 rounded-lg font-mono text-sm font-bold border transition ${
                    aesMode === "encrypt"
                      ? "bg-amber-500 border-amber-500 text-slate-950"
                      : "bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750"
                  }`}
                >
                  Encrypt
                </button>
                <button
                  data-testid="decrypt-btn-aes"
                  onClick={() => {
                    setAesMode("decrypt");
                    handleAesProcess("decrypt");
                  }}
                  className={`flex-1 py-3 rounded-lg font-mono text-sm font-bold border transition ${
                    aesMode === "decrypt"
                      ? "bg-amber-500 border-amber-500 text-slate-950"
                      : "bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750"
                  }`}
                >
                  Decrypt
                </button>
              </div>

              {/* Playback Controls */}
              <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Round: {aesIndex} / 10
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      data-testid="step-backward-btn-aes"
                      onClick={() => setAesIndex((prev) => Math.max(0, prev - 1))}
                      disabled={aesIndex === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Backward"
                    >
                      ⏮️
                    </button>
                    {aesIsPlaying ? (
                      <button
                        type="button"
                        data-testid="pause-btn-aes"
                        onClick={() => setAesIsPlaying(false)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Pause"
                      >
                        ⏸️
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-testid="play-btn-aes"
                        onClick={() => setAesIsPlaying(true)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Play"
                      >
                        ▶️
                      </button>
                    )}
                    <button
                      type="button"
                      data-testid="step-forward-btn-aes"
                      onClick={() => setAesIndex((prev) => Math.min(10, prev + 1))}
                      disabled={aesIndex >= 10}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Forward"
                    >
                      ⏭️
                    </button>
                    <button
                      type="button"
                      data-testid="reset-btn-aes"
                      onClick={() => {
                        setAesIsPlaying(false);
                        setAesIndex(0);
                      }}
                      className="p-1 text-slate-400 hover:text-white transition"
                      aria-label="Reset"
                    >
                      🔄
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label htmlFor="speed-aes" className="text-xs font-mono text-slate-400">Speed</label>
                  <input
                    id="speed-aes"
                    type="range"
                    data-testid="speed-slider-aes"
                    min="100"
                    max="2000"
                    step="100"
                    value={aesSpeed}
                    onChange={(e) => setAesSpeed(parseInt(e.target.value, 10))}
                    className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400">{aesSpeed}ms</span>
                </div>
              </div>

              {aesError && (
                <div
                  data-testid="error-message-aes"
                  className="p-3 bg-red-950/80 border border-red-900 text-red-400 rounded-lg text-sm font-mono"
                >
                  {aesError}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Visualizer */}
              <div
                data-testid="visualizer-aes"
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4"
              >
                <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                  AES-256 CTR Block Diagram & Visualizer
                </span>
                
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-850">
                  <span className="text-xs font-mono text-slate-300">Round {aesIndex} Operation:</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {aesIndex === 0
                      ? "AddRoundKey (Pre-round)"
                      : aesIndex === 10
                      ? "SubBytes, ShiftRows, AddRoundKey (Final)"
                      : "SubBytes, ShiftRows, MixColumns, AddRoundKey"}
                  </span>
                </div>

                <div className="flex flex-col space-y-2 text-xs font-mono">
                  <div className={`p-2 rounded transition ${aesIndex >= 0 ? 'bg-amber-955/30 border border-amber-900/50' : 'bg-slate-900 text-slate-500 border border-slate-850'}`}>
                    <span>1. Key Expansion (generating round keys 0-10)</span>
                  </div>
                  <div className={`p-2 rounded transition ${aesIndex > 0 ? 'bg-amber-955/30 border border-amber-900/50' : 'bg-slate-900 text-slate-500 border border-slate-850'}`}>
                    <span>2. SubBytes: S-Box non-linear byte substitution</span>
                  </div>
                  <div className={`p-2 rounded transition ${aesIndex > 0 ? 'bg-amber-955/30 border border-amber-900/50' : 'bg-slate-900 text-slate-500 border border-slate-850'}`}>
                    <span>3. ShiftRows: Cyclic shift of rows in state matrix</span>
                  </div>
                  <div className={`p-2 rounded transition ${aesIndex > 0 && aesIndex < 10 ? 'bg-amber-955/30 border border-amber-900/50' : 'bg-slate-900 text-slate-500 border border-slate-850'}`}>
                    <span>4. MixColumns: Column transformation in GF(2^8)</span>
                  </div>
                  <div className={`p-2 rounded transition ${aesIndex >= 0 ? 'bg-amber-955/30 border border-amber-900/50' : 'bg-slate-900 text-slate-500 border border-slate-850'}`}>
                    <span>5. AddRoundKey: XOR with round key W[{aesIndex*4}..{aesIndex*4+3}]</span>
                  </div>
                </div>

                {/* SVG Visual Flow */}
                <div className="w-full">
                  <svg className="w-full h-32 border border-slate-800 rounded bg-slate-900" viewBox="0 0 400 120">
                    <rect x="20" y="40" width="80" height="40" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <text x="60" y="64" fill="#f8fafc" fontSize="10" textAnchor="middle" fontFamily="monospace">Plaintext</text>
                    
                    <path d="M 100 60 L 140 60" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrow)" />
                    
                    <rect x="140" y="30" width="120" height="60" rx="4" fill="#fbbf24" fillOpacity="0.1" stroke="#fbbf24" strokeWidth="1.5" />
                    <text x="200" y="54" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="monospace">AES CTR Round {aesIndex}</text>
                    <text x="200" y="74" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">Counter + Nonce</text>

                    <path d="M 260 60 L 300 60" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrow)" />

                    <rect x="300" y="40" width="80" height="40" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <text x="340" y="64" fill="#f8fafc" fontSize="10" textAnchor="middle" fontFamily="monospace">Output</text>
                    
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </div>

              <div>
                <span className="block text-sm font-mono text-slate-300 mb-2">
                  Output Text
                </span>
                <div
                  data-testid="output-text-aes"
                  className="w-full min-h-[80px] p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-amber-500 text-sm whitespace-pre-wrap break-all"
                >
                  {aesOutput}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="rsa"
          ref={sectionRefs.rsa}
          data-testid="exhibit-rsa"
          className="mb-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 opacity-90 hover:opacity-100 transition"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h3 className="text-3xl font-bold text-amber-400 mb-2 font-serif">RSA Cipher</h3>
              <p className="text-sm text-slate-400 font-mono">
                Asymmetric Cryptography (Modular Exponentiation)
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <select
                data-testid="mode-select-rsa"
                value={rsaMode}
                onChange={(e) => setRsaMode(e.target.value as "encrypt" | "decrypt")}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-amber-400 focus:border-amber-500 outline-none"
              >
                <option value="encrypt">Encrypt Mode</option>
                <option value="decrypt">Decrypt Mode</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Key Generation parameters */}
              <div className="bg-slate-950/80 p-5 border border-slate-800 rounded-xl space-y-4">
                <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Key Generation Panel
                </span>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="p-rsa" className="block text-xs font-mono text-slate-400 mb-1">
                      Prime p
                    </label>
                    <input
                      id="p-rsa"
                      type="number"
                      data-testid="param-p-rsa"
                      value={rsaP}
                      onChange={(e) => setRsaP(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 font-mono text-xs text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="q-rsa" className="block text-xs font-mono text-slate-400 mb-1">
                      Prime q
                    </label>
                    <input
                      id="q-rsa"
                      type="number"
                      data-testid="param-q-rsa"
                      value={rsaQ}
                      onChange={(e) => setRsaQ(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 font-mono text-xs text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="e-rsa" className="block text-xs font-mono text-slate-400 mb-1">
                      Exponent e
                    </label>
                    <input
                      id="e-rsa"
                      type="number"
                      data-testid="param-e-rsa"
                      value={rsaE}
                      onChange={(e) => setRsaE(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 font-mono text-xs text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <button
                  data-testid="generate-keys-btn-rsa"
                  onClick={handleRsaKeygen}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-955 font-mono text-xs font-bold rounded transition"
                >
                  Generate RSA Keys
                </button>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-400">Modulus (n):</span>
                    <div data-testid="param-n-rsa" className="mt-1 p-2 bg-slate-900 rounded border border-slate-850 text-slate-200 min-h-[32px] break-all">
                      {rsaN}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Public Key (PEM):</span>
                    <div data-testid="public-key-rsa" className="mt-1 p-2 bg-slate-900 rounded border border-slate-850 text-slate-200 min-h-[32px] break-all font-mono text-[10px] overflow-hidden whitespace-nowrap text-ellipsis">
                      {rsaPublicKey}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="input-rsa" className="block text-sm font-mono text-slate-300 mb-2">
                  Input Message (Number or Text)
                </label>
                <textarea
                  id="input-rsa"
                  data-testid="input-text-rsa"
                  value={rsaInput}
                  onChange={(e) => setRsaInput(e.target.value)}
                  className="w-full h-20 p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-sm text-slate-200 focus:border-amber-500 outline-none"
                  placeholder="Enter message to encrypt or decrypt..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  data-testid="encrypt-btn-rsa"
                  onClick={() => {
                    setRsaMode("encrypt");
                    handleRsaProcess("encrypt");
                  }}
                  className={`flex-1 py-3 rounded-lg font-mono text-sm font-bold border transition ${
                    rsaMode === "encrypt"
                      ? "bg-amber-500 border-amber-500 text-slate-950"
                      : "bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750"
                  }`}
                >
                  Encrypt
                </button>
                <button
                  data-testid="decrypt-btn-rsa"
                  onClick={() => {
                    setRsaMode("decrypt");
                    handleRsaProcess("decrypt");
                  }}
                  className={`flex-1 py-3 rounded-lg font-mono text-sm font-bold border transition ${
                    rsaMode === "decrypt"
                      ? "bg-amber-500 border-amber-500 text-slate-950"
                      : "bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750"
                  }`}
                >
                  Decrypt
                </button>
              </div>

              {/* Playback Controls */}
              <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Step: {rsaIndex + 1} / 5
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      data-testid="step-backward-btn-rsa"
                      onClick={() => setRsaIndex((prev) => Math.max(0, prev - 1))}
                      disabled={rsaIndex === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Backward"
                    >
                      ⏮️
                    </button>
                    {rsaIsPlaying ? (
                      <button
                        type="button"
                        data-testid="pause-btn-rsa"
                        onClick={() => setRsaIsPlaying(false)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Pause"
                      >
                        ⏸️
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-testid="play-btn-rsa"
                        onClick={() => setRsaIsPlaying(true)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Play"
                      >
                        ▶️
                      </button>
                    )}
                    <button
                      type="button"
                      data-testid="step-forward-btn-rsa"
                      onClick={() => setRsaIndex((prev) => Math.min(4, prev + 1))}
                      disabled={rsaIndex >= 4}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Forward"
                    >
                      ⏭️
                    </button>
                    <button
                      type="button"
                      data-testid="reset-btn-rsa"
                      onClick={() => {
                        setRsaIsPlaying(false);
                        setRsaIndex(0);
                      }}
                      className="p-1 text-slate-400 hover:text-white transition"
                      aria-label="Reset"
                    >
                      🔄
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label htmlFor="speed-rsa" className="text-xs font-mono text-slate-400">Speed</label>
                  <input
                    id="speed-rsa"
                    type="range"
                    data-testid="speed-slider-rsa"
                    min="100"
                    max="2000"
                    step="100"
                    value={rsaSpeed}
                    onChange={(e) => setRsaSpeed(parseInt(e.target.value, 10))}
                    className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400">{rsaSpeed}ms</span>
                </div>
              </div>

              {rsaError && (
                <div
                  data-testid="error-message-rsa"
                  className="p-3 bg-red-950/80 border border-red-900 text-red-400 rounded-lg text-sm font-mono"
                >
                  {rsaError}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Visualizer */}
              <div
                data-testid="visualizer-rsa"
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 text-xs font-mono text-slate-350"
              >
                <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                  RSA Mathematical Flow & Diagram
                </span>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`p-2 rounded border transition ${rsaIndex === 0 ? 'bg-amber-950/30 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="font-bold text-slate-300">Step 1: Choose Primes</span>
                    <p className="text-[10px] text-slate-400 mt-1">Select distinct prime numbers: p = {rsaP}, q = {rsaQ}</p>
                  </div>
                  <div className={`p-2 rounded border transition ${rsaIndex === 1 ? 'bg-amber-950/30 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="font-bold text-slate-300">Step 2: Modulus & Totient</span>
                    <p className="text-[10px] text-slate-400 mt-1">n = p * q = {rsaN || "?"}<br/>phi(n) = (p-1)*(q-1) = {rsaPhi || "?"}</p>
                  </div>
                  <div className={`p-2 rounded border transition ${rsaIndex === 2 ? 'bg-amber-950/30 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="font-bold text-slate-300">Step 3: Keys Exponent</span>
                    <p className="text-[10px] text-slate-400 mt-1">Public e = {rsaE}<br/>Private d = e⁻¹ mod phi = {rsaD || "?"}</p>
                  </div>
                  <div className={`p-2 rounded border transition ${rsaIndex === 3 ? 'bg-amber-950/30 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="font-bold text-slate-300">Step 4: Encryption</span>
                    <p className="text-[10px] text-slate-400 mt-1">Cipher C = M^e mod n</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Modulus definition:</span>
                    <span className="text-amber-400 font-bold">n = p * q</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Totient Relation:</span>
                    <span className="text-amber-400 font-bold">d * e ≡ 1 (mod phi)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Decryption Relation:</span>
                    <span className="text-amber-400 font-bold">M = C^d mod n</span>
                  </div>
                </div>

                {/* SVG Visual Flow diagram */}
                <div className="w-full flex justify-center py-2">
                  <svg className="w-full h-28 border border-slate-800 rounded bg-slate-900" viewBox="0 0 400 100">
                    <rect x="15" y="30" width="80" height="40" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <text x="55" y="54" fill="#f8fafc" fontSize="9" textAnchor="middle" fontFamily="monospace">Message (M)</text>

                    <path d="M 95 50 L 150 50" stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#arrow-rsa)" />

                    <rect x="150" y="20" width="100" height="60" rx="4" fill="#fbbf24" fillOpacity="0.1" stroke="#fbbf24" strokeWidth="1.5" />
                    <text x="200" y="44" fill="#fbbf24" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">exponentiation</text>
                    <text x="200" y="58" fill="#e2e8f0" fontSize="8" textAnchor="middle" fontFamily="monospace">mod n</text>

                    <path d="M 250 50 L 305 50" stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#arrow-rsa)" />

                    <rect x="305" y="30" width="80" height="40" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <text x="345" y="54" fill="#f8fafc" fontSize="9" textAnchor="middle" fontFamily="monospace">Cipher (C)</text>

                    <defs>
                      <marker id="arrow-rsa" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </div>

              <div>
                <span className="block text-sm font-mono text-slate-300 mb-2">
                  Output Text
                </span>
                <div
                  data-testid="output-text-rsa"
                  className="w-full min-h-[80px] p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-amber-500 text-sm whitespace-pre-wrap break-all"
                >
                  {rsaOutput}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="sha256"
          ref={sectionRefs.sha256}
          data-testid="exhibit-sha256"
          className="mb-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 opacity-90 hover:opacity-100 transition"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h3 className="text-3xl font-bold text-amber-400 mb-2 font-serif">SHA-256 Hash</h3>
              <p className="text-sm text-slate-400 font-mono">
                Cryptographic Secure Hash Algorithm (256-bit Digest)
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="input-sha256" className="block text-sm font-mono text-slate-300 mb-2">
                  Input Plaintext
                </label>
                <textarea
                  id="input-sha256"
                  data-testid="input-text-sha256"
                  value={shaInput}
                  onChange={(e) => setShaInput(e.target.value)}
                  className="w-full h-28 p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-sm text-slate-200 focus:border-amber-500 outline-none"
                  placeholder="Enter text to hash..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  data-testid="encrypt-btn-sha256"
                  onClick={handleShaProcess}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-amber-400 rounded-lg font-mono text-sm font-bold transition"
                >
                  Hash (encrypt-btn)
                </button>
                <button
                  data-testid="hash-btn-sha256"
                  onClick={handleShaProcess}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-955 font-mono text-sm font-bold rounded-lg transition"
                >
                  Compute SHA-256
                </button>
              </div>

              {/* Playback Controls */}
              <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Step: {shaIndex + 1} / 4
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      data-testid="step-backward-btn-sha256"
                      onClick={() => setShaIndex((prev) => Math.max(0, prev - 1))}
                      disabled={shaIndex === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Backward"
                    >
                      ⏮️
                    </button>
                    {shaIsPlaying ? (
                      <button
                        type="button"
                        data-testid="pause-btn-sha256"
                        onClick={() => setShaIsPlaying(false)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Pause"
                      >
                        ⏸️
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-testid="play-btn-sha256"
                        onClick={() => setShaIsPlaying(true)}
                        className="p-1 text-slate-400 hover:text-white transition"
                        aria-label="Play"
                      >
                        ▶️
                      </button>
                    )}
                    <button
                      type="button"
                      data-testid="step-forward-btn-sha256"
                      onClick={() => setShaIndex((prev) => Math.min(3, prev + 1))}
                      disabled={shaIndex >= 3}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                      aria-label="Step Forward"
                    >
                      ⏭️
                    </button>
                    <button
                      type="button"
                      data-testid="reset-btn-sha256"
                      onClick={() => {
                        setShaIsPlaying(false);
                        setShaIndex(0);
                      }}
                      className="p-1 text-slate-400 hover:text-white transition"
                      aria-label="Reset"
                    >
                      🔄
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label htmlFor="speed-sha256" className="text-xs font-mono text-slate-400">Speed</label>
                  <input
                    id="speed-sha256"
                    type="range"
                    data-testid="speed-slider-sha256"
                    min="100"
                    max="2000"
                    step="100"
                    value={shaSpeed}
                    onChange={(e) => setShaSpeed(parseInt(e.target.value, 10))}
                    className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400">{shaSpeed}ms</span>
                </div>
              </div>

              {shaError && (
                <div
                  data-testid="error-message-sha256"
                  className="p-3 bg-red-950/80 border border-red-900 text-red-400 rounded-lg text-sm font-mono"
                >
                  {shaError}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Visualizer */}
              <div
                data-testid="visualizer-sha256"
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4"
              >
                <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                  SHA-256 Block & Message Padding representation
                </span>

                {(() => {
                  const padInfo = sha256PadDescription(shaInput.length);
                  return (
                    <div className="space-y-3 text-xs font-mono text-slate-350">
                      <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
                        <div className="flex justify-between">
                          <span>Message length:</span>
                          <span className="text-amber-400 font-bold">{padInfo.messageLenBits} bits</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Padding added (1 + zeros):</span>
                          <span className="text-amber-400 font-bold">pad 1 bit + {padInfo.paddingBits} zero bits</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Padded size:</span>
                          <span className="text-amber-400 font-bold">{padInfo.totalLenBytes * 8} bits ({padInfo.blockCount} blocks)</span>
                        </div>
                      </div>

                      {/* Block splitting display */}
                      <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
                        <span className="block font-bold text-slate-300">Message Blocks:</span>
                        <div className="flex space-x-2">
                          <div className="flex-1 p-2 bg-slate-950 border border-slate-800 text-center rounded text-[11px]">
                            Block 1
                          </div>
                          {padInfo.blockCount > 1 && (
                            <div className="flex-1 p-2 bg-slate-950 border border-slate-800 text-center rounded text-[11px]">
                              Block 2
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* SVG Visual Flow diagram */}
                <div className="w-full">
                  <svg className="w-full h-24 border border-slate-800 rounded bg-slate-900" viewBox="0 0 400 90">
                    <rect x="20" y="25" width="80" height="40" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <text x="60" y="47" fill="#f8fafc" fontSize="9" textAnchor="middle" fontFamily="monospace">Message</text>

                    <path d="M 100 45 L 140 45" stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#arrow-sha)" />

                    <rect x="140" y="20" width="120" height="50" rx="4" fill="#fbbf24" fillOpacity="0.1" stroke="#fbbf24" strokeWidth="1.5" />
                    <text x="200" y="41" fill="#fbbf24" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">Padding (pad, 1)</text>
                    <text x="200" y="57" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">64-bit length suffix</text>

                    <path d="M 260 45 L 300 45" stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#arrow-sha)" />

                    <rect x="300" y="25" width="80" height="40" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <text x="340" y="47" fill="#f8fafc" fontSize="9" textAnchor="middle" fontFamily="monospace">Hash Digest</text>

                    <defs>
                      <marker id="arrow-sha" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </div>

              <div>
                <span className="block text-sm font-mono text-slate-300 mb-2">
                  Output Hash
                </span>
                <div
                  data-testid="output-text-sha256"
                  className="w-full min-h-[80px] p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-amber-500 text-sm whitespace-pre-wrap break-all"
                >
                  {shaOutput}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
