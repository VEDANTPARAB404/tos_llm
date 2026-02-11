import React, { useState, useEffect } from 'react';
import { AnalysisState, InputMode, AnalysisResult } from './types';
import { analyzeToS } from './services/geminiService';
import { 
  ShieldAlert, 
  FileText, 
  Link as LinkIcon, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  Search,
  ChevronRight,
  Copy,
  Check,
  RefreshCcw,
  History,
  Trash2,
  Zap,
  Clock
} from 'lucide-react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 15H20C17.2386 15 15 17.2386 15 20V30" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
    <path d="M70 15H80C82.7614 15 85 17.2386 85 20V30" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
    <path d="M30 85H20C17.2386 85 15 82.7614 15 80V70" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
    <path d="M70 85H80C82.7614 85 85 82.7614 85 80V70" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
    <rect x="35" y="44" width="30" height="12" rx="6" fill="currentColor"/>
  </svg>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<InputMode>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [cooldown, setCooldown] = useState(0);
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    error: null,
    result: null,
    progressMessage: ''
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('tos_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const saveToHistory = (result: AnalysisResult) => {
    const newHistory = [result, ...history.filter(h => h.companyName !== result.companyName)].slice(0, 6);
    setHistory(newHistory);
    localStorage.setItem('tos_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('tos_history');
  };

  const loadFromHistory = (result: AnalysisResult) => {
    setState({ loading: false, error: null, result, progressMessage: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (state.loading || cooldown > 0) return;
    setState(prev => ({ ...prev, loading: true, error: null, progressMessage: 'Activating AI Guardian...' }));
    
    try {
      let analysisInput: any;
      if (mode === 'url') {
        if (!url) throw new Error('Please enter a valid URL');
        analysisInput = { type: 'url', value: url };
      } else if (mode === 'file') {
        if (!file) throw new Error('Please upload a PDF document');
        const base64 = await fileToBase64(file);
        analysisInput = { type: 'file', value: { data: base64, mimeType: file.type || 'application/pdf' } };
      } else {
        if (!text) throw new Error('Please paste the ToS text content');
        analysisInput = { type: 'text', value: text };
      }

      const result = await analyzeToS(analysisInput);
      saveToHistory(result);
      setState({ loading: false, error: null, result, progressMessage: '' });
    } catch (err: any) {
      const isQuota = err.message.includes('QUOTA_LIMIT');
      if (isQuota) setCooldown(60);
      
      setState({
        loading: false,
        error: isQuota ? "Google's Free Tier limit reached. We need to wait for a cooldown." : err.message,
        result: null,
        progressMessage: ''
      });
    }
  };

  const reset = () => {
    setState({ loading: false, error: null, result: null, progressMessage: '' });
    setCooldown(0); // Reset cooldown timer
    setFile(null); setUrl(''); setText('');
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-white">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={reset}>
            <div className="bg-primary p-2 rounded-xl shadow-lg relative">
              <Logo className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse shadow-sm"></div>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-black text-slate-900">TermsInShort</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                <Zap className="w-2 h-2 fill-current" /> AI Flash Mode
              </span>
            </div>
          </div>
          <button onClick={reset} className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-bold shadow-sm flex items-center gap-2">
            <RefreshCcw className="w-3.5 h-3.5" /> {state.result ? 'New Scan' : 'Reset'}
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-10 w-full">
        {!state.result && !state.loading && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                Stop blindly <span className="text-primary underline decoration-primary/20 underline-offset-8">accepting.</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-xl mx-auto font-medium">
                Switching to Gemini 3 Flash for faster, high-quota scanning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                  <div className="flex p-2 bg-slate-50 border-b border-slate-100 gap-2">
                    {['url', 'file', 'text'].map((m) => (
                      <button 
                        key={m}
                        onClick={() => setMode(m as InputMode)}
                        className={`flex-1 py-3 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all ${mode === m ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                      >
                        {m === 'url' ? <LinkIcon className="w-4 h-4" /> : m === 'file' ? <FileText className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="p-8 sm:p-10">
                    {mode === 'url' && (
                      <input 
                        type="url" placeholder="Paste terms URL"
                        className="block w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-medium outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                        value={url} onChange={(e) => setUrl(e.target.value)}
                      />
                    )}
                    {mode === 'file' && (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center relative group hover:border-primary">
                        <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                        <p className="font-bold">{file ? file.name : "Upload PDF (Max 10MB)"}</p>
                      </div>
                    )}
                    {mode === 'text' && (
                      <textarea rows={8} className="block w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white" placeholder="Paste text..." value={text} onChange={(e) => setText(e.target.value)} />
                    )}

                    <button 
                      onClick={handleAnalyze}
                      disabled={state.loading || cooldown > 0}
                      className="w-full mt-8 bg-primary text-white font-black py-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                    >
                      {cooldown > 0 ? `Cooldown: ${cooldown}s` : 'Deep Scan Terms'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4">
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest flex items-center gap-2">
                      <History className="w-4 h-4 text-primary" /> History
                    </h3>
                    <button onClick={clearHistory} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3">
                    {history.map((h, i) => (
                      <button key={i} onClick={() => loadFromHistory(h)} className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent flex items-center justify-between group">
                        <p className="text-slate-900 font-black text-sm truncate">{h.companyName}</p>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {state.error && (
              <div className={`mt-8 p-5 border rounded-2xl flex items-start gap-4 animate-shake ${cooldown > 0 ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                {cooldown > 0 ? <Clock className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                <div>
                  <p className="font-black text-sm uppercase mb-1">{cooldown > 0 ? 'Rate Limit (Free Tier)' : 'Scanning Error'}</p>
                  <p className="text-sm font-medium">{state.error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {state.loading && (
          <div className="max-w-2xl mx-auto text-center py-24">
            <div className="w-28 h-28 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-12"></div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">AI Analysis in Progress</h2>
            <p className="text-slate-500 font-bold text-lg animate-pulse">{state.progressMessage}</p>
          </div>
        )}

        {state.result && <ResultsView result={state.result} onReset={reset} />}
      </main>

      <footer className="bg-white border-t border-slate-100 py-10 text-center text-slate-400 text-xs font-medium">
        © 2024 TermsInShort. Powered by Gemini 3 Flash.
      </footer>
    </div>
  );
};

const ResultsView: React.FC<{ result: AnalysisResult; onReset: () => void }> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const copyReport = () => {
    navigator.clipboard.writeText(`${result.companyName} Analysis: ${result.summary}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto space-y-10 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center font-black text-2xl text-slate-800">
                  {result.companyName.charAt(0)}
                </div>
                <h1 className="text-4xl font-black text-slate-900">{result.companyName}</h1>
              </div>
              <button onClick={copyReport} className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border-l-4 border-primary">"{result.summary}"</p>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-6">"Guardian's Opinion"</h3>
              <p className="text-slate-300 text-xl font-medium leading-relaxed mb-8">{result.expertOpinion}</p>
              <button onClick={onReset} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black hover:bg-primary-dark transition-all">New Analysis</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center">
          <h3 className="text-slate-400 font-black text-xs uppercase mb-8">Safety Index</h3>
          <div className="text-5xl font-black text-slate-900 mb-2">{result.riskScore}%</div>
          <div className={`px-6 py-2 rounded-2xl border-2 font-black text-sm uppercase mb-4 ${result.riskScore > 70 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            {result.verdict}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
          <AlertTriangle className="w-10 h-10 text-red-500" /> Top 5 Critical Exposures
        </h2>
        <div className="grid gap-6">
          {result.criticalPoints.map((p, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 flex gap-6 items-start">
              <div className={`p-4 rounded-xl ${p.severity === 'High' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">{p.title}</h4>
                <p className="text-slate-600 font-medium mt-2">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
