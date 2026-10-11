import React, { useState, useEffect } from 'react';
import { runTestVectorsSuite, TestResult, OFFICIAL_TEST_VECTORS } from '../utils/testVectors';
import { FileCheck2, Play, CheckCircle2, XCircle, Download, Copy, RefreshCw, Cpu, Layers } from 'lucide-react';

export const TestVectorRunner: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'RFC4226' | 'RFC6238'>('ALL');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const executeSuite = async () => {
    setRunning(true);
    setTimeout(async () => {
      const res = await runTestVectorsSuite();
      setResults(res);
      setRunning(false);
    }, 300);
  };

  useEffect(() => {
    executeSuite();
  }, []);

  const totalCount = results.length;
  const passCount = results.filter((r) => r.passed).length;
  const failCount = totalCount - passCount;
  const avgLatency = results.length > 0
    ? (results.reduce((acc, r) => acc + r.durationMs, 0) / results.length).toFixed(3)
    : '0.000';

  const filteredResults = results.filter((r) => {
    if (activeFilter === 'RFC4226') return r.vector.rfc.includes('HOTP');
    if (activeFilter === 'RFC6238') return r.vector.rfc.includes('TOTP');
    return true;
  });

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arithmatrix-otp-rfc-test-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdownReport = () => {
    let md = `# ArithMatrix OTP Engine - RFC Compliance Report\n\n`;
    md += `**Total Vectors:** ${totalCount} | **Passed:** ${passCount} | **Failed:** ${failCount}\n\n`;
    md += `| RFC Standard | Algorithm | Key / Vector | Expected OTP | Generated OTP | Status |\n`;
    md += `|---|---|---|---|---|---|\n`;

    results.forEach((r) => {
      md += `| ${r.vector.rfc} | ${r.vector.algorithm} | ${r.vector.description} | \`${r.vector.expectedOtp}\` | \`${r.generatedOtp}\` | ${r.passed ? '✅ PASS' : '❌ FAIL'} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="arith-panel arith-panel-hover rounded-2xl p-6 border border-slate-900 relative overflow-hidden shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider border border-emerald-800/60 inline-flex items-center gap-1.5">
            Standard Compliance Matrix
          </span>
          <h2 className="text-xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" /> RFC 6238 & RFC 4226 Test Vector Benchmark
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={executeSuite}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 text-black font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            {running ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-black" />
            )}
            <span>{running ? 'Running Tests...' : 'Run Standard Suite'}</span>
          </button>

          <button
            onClick={handleCopyMarkdownReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all border border-slate-800"
          >
            <Copy className="w-4 h-4 text-emerald-400" />
            <span>{copiedReport ? 'Report Copied!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all border border-slate-800"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-mono">Total Vectors</span>
            <span className="text-2xl font-black text-white">{totalCount}</span>
          </div>
          <Layers className="w-8 h-8 text-slate-600" />
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 block font-mono">Passed RFC Tests</span>
            <span className="text-2xl font-black text-emerald-400">{passCount}</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-400 block font-mono">Failed Tests</span>
            <span className="text-2xl font-black text-rose-400">{failCount}</span>
          </div>
          <XCircle className="w-8 h-8 text-rose-500/40" />
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 block font-mono">Avg Latency / Test</span>
            <span className="text-2xl font-black text-emerald-300 font-mono">{avgLatency}ms</span>
          </div>
          <Cpu className="w-8 h-8 text-emerald-500/40" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-900 text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-emerald-500 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({OFFICIAL_TEST_VECTORS.length})
          </button>
          <button
            onClick={() => setActiveFilter('RFC4226')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeFilter === 'RFC4226'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            RFC 4226 HOTP (10)
          </button>
          <button
            onClick={() => setActiveFilter('RFC6238')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeFilter === 'RFC6238'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            RFC 6238 TOTP (11)
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:block">
          Official Standard Benchmarks
        </span>
      </div>

      {/* Test Results Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden shadow-xl">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-300 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">RFC Standard</th>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Test Description</th>
                <th className="py-3 px-4">Expected OTP</th>
                <th className="py-3 px-4">Generated OTP</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {filteredResults.map((res, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-300">{res.vector.rfc}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 font-bold">
                      {res.vector.algorithm}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">{res.vector.description}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-200">{res.vector.expectedOtp}</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-300">{res.generatedOtp}</td>
                  <td className="py-2.5 px-4">
                    {res.passed ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/60 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> PASS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-bold border border-rose-800/60 flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" /> FAIL
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500">
                    {res.durationMs.toFixed(3)}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
