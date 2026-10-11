# 🔐 ArithMatrix OTP Studio : One-Time Password Generator & Verifier Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Standards](https://img.shields.io/badge/RFC_6238-TOTP-00dc82?logo=shield&logoColor=black)](https://datatracker.ietf.org/doc/html/rfc6238)
[![Standards](https://img.shields.io/badge/RFC_4226-HOTP-facc15?logo=shield&logoColor=black)](https://datatracker.ietf.org/doc/html/rfc4226)
[![Security](https://img.shields.io/badge/Security-HMAC--SHA1%2F256%2F512-emerald?logo=lock&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

> A minimalist, production-grade Two-Factor Authentication (2FA) engine and cryptographic verification suite engineered for the **ArithMatrix Technologies Internship**. Generate time-based (TOTP) and event-based (HOTP) one-time passwords, verify tokens against strict validity windows, inspect byte-level dynamic truncation, and validate standard compliance against official RFC test vectors.

---

## ⚡ Key Features

- ⏱️ **Dual Core OTP Engines**:
  - **TOTP (RFC 6238)**: Time-Based One-Time Passwords with customizable time steps ($15\text{s}, 30\text{s}, 60\text{s}$), epoch offsets, configurable digits ($6$ or $8$), and smooth circular SVG countdown progress rings.
  - **HOTP (RFC 4226)**: Event/Counter-Based One-Time Passwords with 64-bit big-endian counter state, manual/automatic incrementing, and counter resynchronization lookahead windows.
    
- 📱 **Authenticator App Integration**: Instant QR code generation following standard `otpauth://` URI schemes, compatible with **Google Authenticator**, **Authy**, **1Password**, and **Apple Passwords**.
  
- 🛡️ **Comprehensive Security & Verification Engine**:
  - **Clock Drift Tolerance**: Flexible time-drift validation across custom step intervals ($\pm 0, \pm 1, \pm 2$).
  - **Single-Use Replay Protection Guard**: In-memory token invalidation preventing reuse of submitted OTPs within identical time windows.
  - **Brute-Force Rate Limiter**: Automatic 30-second lockout threshold after 5 consecutive failed verification attempts.
  - **Constant-Time Comparison**: Bitwise XOR equality check (`constantTimeCompare`) eliminating side-channel timing leaks.
    
- 🧪 **100% RFC Test Vector Compliance**: Built-in benchmark suite executing official test vectors for RFC 6238 (HMAC-SHA1, SHA256, SHA512 at timestamps 59s, 1.11B s, 1.23B s, 2B s) and RFC 4226 (counters 0–9) with exportable JSON/Markdown audit reports.
  
- 🔓 **Hashed Password Decryptor Intro FX**: High-tech cyber decryptor sequence with scrambling hex terminal animations and keyhole unlocking transitions on page refresh.
  
- 🎨 **Minimalist Dual-Brand Cyber Aesthetic**: Pitch-black theme (`#020408`) blending the **ArithMatrix Technologies** ($\mathbf{AI_X}$) emerald brand identity with the developer's signature yellow wireframe globe network keyhole logo.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Build Tooling & Server** | [Vite 6](https://vitejs.dev/) with HMR, Node.js Native HTTP Daemon |
| **Styling & Theme** | [Tailwind CSS v3](https://tailwindcss.com/), Glassmorphism, CSS Custom Keyframes |
| **Iconography & Graphics** | [Lucide React](https://lucide.dev/), Custom Dual-Brand SVGs, Canvas Confetti |
| **Cryptography** | Web Crypto API (`crypto.subtle`), Pure JS Fallback HMAC (SHA-1, SHA-256, SHA-512) |
| **QR Generation** | [node-qrcode](https://github.com/soldair/node-qrcode) rendering to HTML5 Canvas |

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have **Node.js** (v18 or higher) and **npm** installed on your system.

### 1. Installation
Navigate to the project root directory and install dependencies:

```bash
cd otp-generator-verifier
npm install
```

### 2. Development Server
Launch the development server:

```bash
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:3050/
```

### 3. Production Build
Generate an optimized production bundle:

```bash
npm run build
```

To preview the built production app locally using the standalone server:
```bash
node server.js
```

---

## 💡 How the OTP Engine Works

### 1. Moving Factor Computation
- **For TOTP (RFC 6238)**: Derived from the current Unix timestamp $t$, epoch $T_0 = 0$, and time step interval $X$ (default 30 seconds):
  $$T = \left\lfloor \frac{t - T_0}{X} \right\rfloor$$
- **For HOTP (RFC 4226)**: Uses an incrementing 64-bit event counter $C$.

The resulting 64-bit unsigned integer is serialized into an **8-byte Big-Endian byte array**.

### 2. HMAC Hash Computation
Using the shared secret key $K$ (decoded from Base32 RFC 4648) and the moving factor byte array $T$, the engine computes the HMAC digest $HS$:
$$HS = \text{HMAC-Hash}(K, T)$$

*Supported Hash Algorithms: HMAC-SHA-1 (20 bytes), HMAC-SHA-256 (32 bytes), HMAC-SHA-512 (64 bytes).*

### 3. Code Generation
$$\text{OTP} = P \pmod{10^d}$$
The integer is zero-padded to $d$ digits (e.g., 6 or 8 digits).

### 4. Verification & Security Rules Pipeline
```
[User Submitted OTP] ──► [1. Rate Limiter Check] (Max 5 attempts / 30s lockout)
                                │ (Pass)
                                ▼
                       [2. Clock Drift Match] (Window T - Δ to T + Δ)
                                │ (Match)
                                ▼
                       [3. Replay Guard Check] (Tuple <K, OTP, T> used?)
                                │ (Unique)
                                ▼
                       [4. Constant-Time Compare] (Bitwise XOR comparison)
                                │
                                ▼
                       [Token Validated ✅]
```

---

## 🧪 Sample RFC Test Vectors

The engine verifies against official IETF benchmark test vectors with **100% compliance**:

### RFC 4226 HOTP (SHA-1, 6 Digits, Key: `12345678901234567890`)
| Counter ($C$) | Expected HOTP | Result |
| :---: | :---: | :---: |
| `0` | `755224` | ✅ PASS |
| `1` | `287082` | ✅ PASS |
| `2` | `359152` | ✅ PASS |
| `3` | `969429` | ✅ PASS |
| `4` | `338314` | ✅ PASS |
| `5` | `254676` | ✅ PASS |
| `6` | `287922` | ✅ PASS |
| `7` | `162583` | ✅ PASS |
| `8` | `399871` | ✅ PASS |
| `9` | `520489` | ✅ PASS |

### RFC 6238 TOTP (8 Digits, Step: 30s)
| Algorithm | Unix Timestamp | Moving Factor ($T$) | Expected OTP | Result |
| :---: | :---: | :---: | :---: | :---: |
| **HMAC-SHA1** | 59s | 1 | `94287082` | ✅ PASS |
| **HMAC-SHA1** | 1,111,111,109s | 37,037,036 | `07081804` | ✅ PASS |
| **HMAC-SHA1** | 1,234,567,890s | 41,152,263 | `89005924` | ✅ PASS |
| **HMAC-SHA256** | 59s | 1 | `46119246` | ✅ PASS |
| **HMAC-SHA256** | 1,234,567,890s | 41,152,263 | `91819424` | ✅ PASS |
| **HMAC-SHA512** | 59s | 1 | `90698825` | ✅ PASS |
| **HMAC-SHA512** | 1,234,567,890s | 41,152,263 | `93441116` | ✅ PASS |

---

## 🏢 Project Structure

```text
otp-generator-verifier/
├── public/
│   └── favicon.svg                  # Brand favicon
├── src/
│   ├── components/
│   │   ├── ArithMatrixLogo.tsx      # Official AIx ArithMatrix brand logo SVG
│   │   ├── UserBrandLogo.tsx        # Developer yellow globe keyhole brand logo SVG
│   │   ├── Header.tsx               # Dual-brand navigation & FX triggers
│   │   ├── Footer.tsx               # Author credits & social links
│   │   ├── TotpGenerator.tsx        # Time-based OTP generator & SVG progress ring
│   │   ├── HotpGenerator.tsx        # Event-based counter OTP generator
│   │   ├── OtpVerifier.tsx          # Real-time verification sandbox & security rules
│   │   ├── BitwiseInspector.tsx     # Byte-level dynamic truncation inspector
│   │   ├── TestVectorRunner.tsx     # RFC 6238 / 4226 compliance benchmark matrix
│   │   ├── FlowDiagram.tsx          # Visual lifecycle architecture diagram
│   │   ├── SecurityAuditDoc.tsx     # Embedded RFC documentation modal
│   │   └── UnlockIntroAnimation.tsx # Scrambling hashed password decryptor intro
│   ├── utils/
│   │   ├── cryptoOtp.ts             # Core RFC 4226 & 6238 cryptographic algorithms
│   │   └── testVectors.ts           # Standard test vectors data & execution suite
│   ├── App.tsx                      # Main single-page minimalist dashboard
│   ├── index.css                    # ArithMatrix cyber theme & animations
│   └── main.tsx                     # React DOM entry point
├── package.json
├── README.md
├── server.js                        # Native Node HTTP server daemon
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 👨‍💻 Developer & Internship Attribution

- **Project**: ArithMatrix Technologies Internship Project
- **Developer**: **Mohammed Zuoriki**
- **GitHub**: [@Code-tech77](https://github.com/Code-tech77)
- **LinkedIn**: [mohammed-zuoriki-856133250](https://www.linkedin.com/in/mohammed-zuoriki-856133250/?isSelfProfile=true)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
