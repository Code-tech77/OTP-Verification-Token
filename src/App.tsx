import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TotpGenerator } from './components/TotpGenerator';
import { HotpGenerator } from './components/HotpGenerator';
import { OtpVerifier } from './components/OtpVerifier';
import { BitwiseInspector } from './components/BitwiseInspector';
import { TestVectorRunner } from './components/TestVectorRunner';
import { FlowDiagram } from './components/FlowDiagram';
import { SecurityAuditDoc } from './components/SecurityAuditDoc';
import { UnlockIntroAnimation } from './components/UnlockIntroAnimation';
import { HashAlgorithm, DynamicTruncationResult, generateRandomSecret } from './utils/cryptoOtp';
import { Clock, Hash, Sparkles, Key, Cpu, ShieldCheck, FileCheck2, Info } from 'lucide-react';

export function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isHotpMode, setIsHotpMode] = useState<boolean>(false);
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'ENGINE' | 'INSPECTOR' | 'BENCHMARK' | 'FLOW'>('ENGINE');

  // Shared Engine State
  const [secret, setSecret] = useState<string>('JBSWY3DPEHPK3PXP');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-1');
  const [digits, setDigits] = useState<number>(6);
  const [period, setPeriod] = useState<number>(30);
  const [counter, setCounter] = useState<number>(0);

  // Bitwise Inspector Details State
  const [inspectionDetails, setInspectionDetails] = useState<DynamicTruncationResult | null>(null);

  const handleLoadDemoRfcSha1 = () => {
    setSecret('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
    setAlgorithm('SHA-1');
    setDigits(6);
  };

  const handleLoadDemoSha256 = () => {
    setSecret('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
    setAlgorithm('SHA-256');
    setDigits(8);
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black relative">
      {/* Decrypting Hashed Password Intro Animation */}
      {showIntro && (
        <UnlockIntroAnimation onComplete={() => setShowIntro(false)} />
      )}

      {/* Cyber Grid & Dual Ambient Glows */}
      <div className="fixed inset-0 bg-cyber-grid opacity-25 pointer-events-none z-0" />
      <div className="fixed -top-40 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="fixed bottom-10 left-10 w-[400px] h-[400px] bg-yellow-500/5 blur-[160px] pointer-events-none rounded-full" />

      {/* Dual Logo Header */}
      <Header
        onOpenDoc={() => setShowDocModal(true)}
        onReplayIntro={() => setShowIntro(true)}
      />

      {/* Main Single-Page Minimalist Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-8 relative z-10">
        
        {/* Top Minimalist Control Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/90 p-4 rounded-2xl border border-slate-900 shadow-xl backdrop-blur-md">
          {/* Mode Selector */}
          <div className="flex items-center gap-2 bg-[#020408] p-1.5 rounded-xl border border-slate-900">
            <button
              onClick={() => setIsHotpMode(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                !isHotpMode
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Time-Based (TOTP)</span>
            </button>

            <button
              onClick={() => setIsHotpMode(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                isHotpMode
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Event-Based (HOTP)</span>
            </button>
          </div>

          {/* Quick Filter Navigation within Single Page */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveSection('ENGINE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeSection === 'ENGINE'
                  ? 'bg-yellow-500 text-black font-extrabold shadow-md shadow-yellow-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Studio Engine</span>
            </button>

            <button
              onClick={() => setActiveSection('INSPECTOR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeSection === 'INSPECTOR'
                  ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>HMAC Inspector</span>
            </button>

            <button
              onClick={() => setActiveSection('BENCHMARK')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeSection === 'BENCHMARK'
                  ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>RFC Suite</span>
            </button>

            <button
              onClick={() => setActiveSection('FLOW')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeSection === 'FLOW'
                  ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Architecture</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" /> Presets:
            </span>
            <button
              onClick={handleLoadDemoRfcSha1}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-lg border border-slate-800"
            >
              RFC SHA-1
            </button>
            <button
              onClick={handleLoadDemoSha256}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-lg border border-slate-800"
            >
              SHA-256
            </button>
            <button
              onClick={() => setSecret(generateRandomSecret(20))}
              className="px-2.5 py-1 bg-yellow-950/60 hover:bg-yellow-900/60 text-yellow-300 text-xs font-mono rounded-lg border border-yellow-800/40 flex items-center gap-1"
            >
              <Key className="w-3 h-3" /> Random
            </button>
          </div>
        </div>

        {/* Streamlined Core Views */}
        {(activeSection === 'ENGINE' || activeSection === 'INSPECTOR') && (
          <div className="space-y-8">
            {/* Primary Generator Card */}
            {!isHotpMode ? (
              <TotpGenerator
                secret={secret}
                setSecret={setSecret}
                algorithm={algorithm}
                setAlgorithm={setAlgorithm}
                digits={digits}
                setDigits={setDigits}
                period={period}
                setPeriod={setPeriod}
                onInspectDetails={setInspectionDetails}
              />
            ) : (
              <HotpGenerator
                secret={secret}
                setSecret={setSecret}
                algorithm={algorithm}
                setAlgorithm={setAlgorithm}
                digits={digits}
                setDigits={setDigits}
                counter={counter}
                setCounter={setCounter}
                onInspectDetails={setInspectionDetails}
              />
            )}

            {/* Real-Time Verifier Sandbox */}
            <OtpVerifier
              secret={secret}
              algorithm={algorithm}
              digits={digits}
              period={period}
              counter={counter}
              isHotpMode={isHotpMode}
            />

            {/* Bitwise HMAC Dynamic Truncation Inspector */}
            <BitwiseInspector details={inspectionDetails} digits={digits} />
          </div>
        )}

        {/* RFC Standard Benchmark Section */}
        {activeSection === 'BENCHMARK' && <TestVectorRunner />}

        {/* Architecture Flow Section */}
        {activeSection === 'FLOW' && <FlowDiagram />}

      </main>

      {/* Footer */}
      <Footer onOpenDoc={() => setShowDocModal(true)} />

      {/* Docs Modal */}
      {showDocModal && <SecurityAuditDoc onClose={() => setShowDocModal(false)} />}
    </div>
  );
}
