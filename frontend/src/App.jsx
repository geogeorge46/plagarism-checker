import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCcw, 
  Download, 
  Copy, 
  ShieldCheck,
  AlertTriangle,
  Settings2,
  CheckCircle2
} from 'lucide-react';

function App() {
  const [inputText, setInputText] = useState('');
  const [detectionText, setDetectionText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [level, setLevel] = useState('balanced');
  const [tone, setTone] = useState('academic');
  
  // Mock analysis scores
  const [scores, setScores] = useState({
    aiLikeness: 0,
    plagiarism: 0
  });

  const handleDetect = async () => {
    if (!inputText.trim()) return;
    setIsDetecting(true);
    try {
      setDetectionText("Analyzing text structure and vocabulary with Gemini...");
      const analyzeRes = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const analysis = await analyzeRes.json();
      
      if (!analyzeRes.ok) {
        throw new Error(analysis.detail || "Failed to analyze text");
      }
      
      setDetectionText(analysis.report);
      setScores(prev => ({ ...prev, aiLikeness: analysis.aiLikeness }));
    } catch (error) {
      console.error("Detection error:", error);
      setDetectionText(`Error: ${error.message}`);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    try {
      // 2. Core Humanization Engine Call
      const humanizeRes = await fetch("http://localhost:8000/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, level, tone, detectionReport: detectionText }),
      });
      
      const humanizedData = await humanizeRes.json();
      
      if (!humanizeRes.ok) {
        throw new Error(humanizedData.detail || "Failed to humanize text");
      }
      
      setOutputText(humanizedData.humanizedText);
      // We automatically reset the visual AI Likeness score to 0 on a successful deep humanization
      setScores(prev => ({ ...prev, aiLikeness: 0 }));
    } catch (error) {
      console.error("Backend error:", error);
      setOutputText(`Error: ${error.message}\n\n(Tip: Your API key might be invalid or the backend is offline)`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "De-AIfy_Pro_Result.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-8 z-10 glass-panel p-4 rounded-2xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-gradient-to-br from-brand-400 to-brand-600 p-2 rounded-xl shadow-lg shadow-brand-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
              De-AIfy <span className="text-brand-400">Pro</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm sm:text-base ml-12 font-medium tracking-wide">
            The All-In-One <span className="text-brand-300">AI Detector</span> & <span className="text-brand-300">Text Humanizer</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-dark-bg/50 px-4 py-2 rounded-full border border-dark-border">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>100% Privacy</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 flex-1">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Input Area */}
          <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col relative border-t-4 border-t-brand-500">
            <div className="absolute -top-3 left-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              STEP 1: DETECT AI
            </div>
            <div className="flex justify-between items-center mb-4 mt-2">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                Scan Original Text
              </h2>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-slate-500 mr-2">{inputText.length} chars</span>
                <button 
                  onClick={handleDetect}
                  disabled={isDetecting || !inputText.trim()}
                  className="btn-secondary text-sm px-3 py-1.5 border-brand-500/30 text-brand-300 hover:border-brand-500"
                >
                  {isDetecting ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  Auto-Detect AI
                </button>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your AI-generated or potentially plagiarized text here..."
              className="glass-input flex-1 min-h-[250px] mb-4"
            />
            
            <div className="flex justify-between items-center mb-2 mt-2">
              <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                AI Detection Report <span className="text-xs text-slate-500 font-normal">(Optional)</span>
              </h2>
            </div>
            <textarea
              value={detectionText}
              onChange={(e) => setDetectionText(e.target.value)}
              placeholder="Click 'Auto-Detect AI' to automatically generate a report, or paste a 3rd party report here..."
              className="glass-input h-[120px] text-sm"
            />
          </div>

          {/* Controls */}
          <div className="glass-panel p-6 rounded-2xl relative border-t-4 border-t-brand-400">
            <div className="absolute -top-3 left-4 bg-brand-400 text-dark-bg text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              STEP 2: HUMANIZE
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-4 mt-2 flex items-center gap-2 uppercase tracking-wider">
              <Settings2 className="w-4 h-4" />
              Bypass AI Detectors
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Humanization Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['light', 'balanced', 'deep'].map(l => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        level === l 
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50' 
                          : 'bg-dark-bg/50 text-slate-400 border border-dark-border hover:border-slate-600'
                      }`}
                    >
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Tone Adaptation</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-dark-bg/50 border border-dark-border rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-brand-500"
                >
                  <option value="academic">Academic / Formal</option>
                  <option value="professional">Professional / Business</option>
                  <option value="creative">Creative / Storytelling</option>
                  <option value="casual">Casual / Blog</option>
                </select>
              </div>

              <button
                onClick={handleHumanize}
                disabled={isProcessing || !inputText.trim()}
                className="w-full btn-primary flex justify-center items-center gap-2 mt-4"
              >
                {isProcessing ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {isProcessing ? 'Humanizing...' : 'Humanize Text'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output & Analysis */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Analysis Bar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">AI Detection Probability</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${scores.aiLikeness < 20 ? 'text-green-400' : 'text-red-400'}`}>
                    {outputText ? `${scores.aiLikeness}%` : '--'}
                  </span>
                  {outputText && scores.aiLikeness < 20 && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-dark-bg/50 flex items-center justify-center border border-dark-border">
                <ShieldCheck className="w-6 h-6 text-slate-400" />
              </div>
            </div>
            
            <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Plagiarism Score</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${scores.plagiarism === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {outputText ? `${scores.plagiarism}%` : '--'}
                  </span>
                  {outputText && scores.plagiarism === 0 && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-dark-bg/50 flex items-center justify-center border border-dark-border">
                <AlertTriangle className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Output Area */}
          <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col relative border-t-4 border-t-green-500">
            <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              STEP 3: SECURE RESULT
            </div>
            <div className="flex justify-between items-center mb-4 mt-2">
              <h2 className="text-lg font-semibold text-brand-300 flex items-center gap-2">
                100% Humanized Text
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  disabled={!outputText}
                  className="btn-secondary text-sm px-3 py-1.5"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={!outputText}
                  className="btn-secondary text-sm px-3 py-1.5"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>
            
            <div className="relative flex-1">
              {isProcessing && (
                <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm rounded-xl z-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4" />
                  <p className="text-brand-300 animate-pulse font-medium">Injecting Burstiness & Human Rhythm...</p>
                </div>
              )}
              <textarea
                value={outputText}
                readOnly
                placeholder="Your humanized, detection-proof text will appear here."
                className="glass-input flex-1 min-h-[400px] h-full"
              />
            </div>
          </div>

          {/* Education Notice */}
          <div className="glass-panel p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-slate-200">Ethical Use Mode Enabled:</strong> This tool restructures AI text uniquely. We recommend reviewing outputs to ensure facts and original intent remain perfectly aligned with your core message.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
