import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  HashAlgorithm,
  OtpOptions,
  generateOtpWithDetails,
  generateRandomSecret,
  generateOtpAuthUrl
} from '../utils/cryptoOtp';
import { Copy, RefreshCw, QrCode, Clock, Key, Cpu, Check, ShieldCheck } from 'lucide-react';

interface TotpGeneratorProps {
  secret: string;
  setSecret: (s: string) => void;
  algorithm: HashAlgorithm;
  setAlgorithm: (a: HashAlgorithm) => void;
  digits: number;
  setDigits: (d: number) => void;
  period: number;
  setPeriod: (p: number) => void;
  onInspectDetails?: (details: any) => void;
}

export const TotpGenerator: React.FC<TotpGeneratorProps> = ({
  secret,
  setSecret,
  algorithm,
  setAlgorithm,
  digits,
  setDigits,
  period,
  setPeriod,
  onInspectDetails
}) => {
  const [currentOtp, setCurrentOtp] = useState<string>('------');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(period);
  const [copied, setCopied] = useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('intern@arithmatrix.io');
  const [issuer, setIssuer] = useState<string>('ArithMatrix Tech');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Recalculate OTP & Tick Timer
  useEffect(() => {
    let isMounted = true;

    const updateTotp = async () => {
      const options: OtpOptions = {
        secret,
        isBase32: true,
        algorithm,
        digits,
        period
      };

      try {
        const details = await generateOtpWithDetails(options);
        if (isMounted) {
          setCurrentOtp(details.otp);
          if (onInspectDetails) {
            onInspectDetails(details);
          }
        }
      } catch (err) {
        if (isMounted) {
          setCurrentOtp('ERROR');
        }
      }
    };

    updateTotp();

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = period - (now % period);
      setSecondsRemaining(remaining);

      if (remaining === period || remaining === period - 1) {
        updateTotp();
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [secret, algorithm, digits, period]);

  // Generate QR Code Canvas
  useEffect(() => {
    const authUrl = generateOtpAuthUrl(secret, accountName, issuer, {
      algorithm,
      digits,
      period
    });
    setQrUrl(authUrl);

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        authUrl,
        {
          width: 210,
          margin: 1.5,
          color: {
            dark: '#00dc82',
            light: '#030508'
          }
        },
        () => {}
      );
    }
  }, [secret, accountName, issuer, algorithm, digits, period]);

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(currentOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateSecret = () => {
    const newSecret = generateRandomSecret(20);
    setSecret(newSecret);
  };

  // Timer Progress Calculation
  const progressPercent = (secondsRemaining / period) * 100;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className="arith-panel arith-panel-hover rounded-2xl p-6 border border-slate-900 relative overflow-hidden shadow-2xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-900">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider border border-emerald-800/60 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> RFC 6238 Standard
          </span>
          <h2 className="text-xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" /> Time-Based OTP (TOTP) Engine
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all border border-slate-800 hover:border-emerald-500/50"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Authenticator QR</span>
          </button>
          <button
            onClick={handleRegenerateSecret}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-semibold transition-all border border-emerald-800/60 hover:border-emerald-400"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Secret</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live OTP Token Display & Countdown Ring */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-slate-900 relative">
          <div className="absolute inset-0 bg-cyber-grid opacity-30 rounded-2xl pointer-events-none" />

          {/* Circular Progress Ring with OTP Display */}
          <div className="relative w-56 h-56 flex items-center justify-center my-4 group">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-slate-900"
                strokeWidth="5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className={`transition-all duration-1000 ease-linear ${
                  secondsRemaining <= 5
                    ? 'text-rose-500'
                    : secondsRemaining <= 10
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
                strokeWidth="5"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-semibold">
                Active TOTP Token
              </span>
              <span className="monospaced-code text-4xl sm:text-5xl font-black tracking-wider text-white glow-emerald">
                {currentOtp}
              </span>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Refreshes in <strong className="text-white">{secondsRemaining}s</strong></span>
              </div>
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyOtp}
            className={`w-full max-w-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold transition-all shadow-lg ${
              copied
                ? 'bg-emerald-400 text-black shadow-emerald-400/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy OTP Token</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Parameters */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Secret Key Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" /> Secret Key (Base32)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                RFC 4648 Compliant
              </span>
            </label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase transition-colors"
              placeholder="e.g. JBSWY3DPEHPK3PXP"
            />
          </div>

          {/* Algorithm Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> HMAC Algorithm
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['SHA-1', 'SHA-256', 'SHA-512'] as HashAlgorithm[]).map((algo) => (
                <button
                  key={algo}
                  onClick={() => setAlgorithm(algo)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all border ${
                    algorithm === algo
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          {/* Digits & Time Step Selectors */}
          <div className="grid grid-cols-2 gap-4">
            {/* Digit Length */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Digit Output Length
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[6, 8].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDigits(d)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all border ${
                      digits === d
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d} Digits
                  </button>
                ))}
              </div>
            </div>

            {/* Time Step X */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Time Interval (X)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[15, 30, 60].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all border text-center ${
                      period === p
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Formula Info Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-400 font-mono space-y-1">
            <div className="text-slate-300 font-semibold flex items-center justify-between">
              <span>Moving Factor Formula:</span>
              <span className="text-emerald-400 font-bold">T = ⌊(UnixTime - T0) / {period}⌋</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Uniform 8-byte big-endian counter refreshed every {period} seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Authenticator QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#080c14] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" /> Authenticator Sync QR
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Scan this QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, <strong>1Password</strong>, or <strong>Apple Passwords</strong> to sync real-time 2FA codes!
            </p>

            <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-900">
              <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
              <span className="text-[11px] text-slate-400 font-mono mt-3 break-all text-center max-w-xs">
                {qrUrl}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Account Label</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Issuer</label>
                <input
                  type="text"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition-colors"
            >
              Done Scanning
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
