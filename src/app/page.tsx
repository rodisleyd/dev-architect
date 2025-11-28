"use client";

import { useState, useEffect, ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prev) => {
          // Vai até 95% devagarzinho para não dar ansiedade
          if (prev >= 95) return 95; 
          return prev + Math.random() * 5;
        });
      }, 1000); // Mais lento para acompanhar o tempo da IA
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // --- NOVA COMPRESSÃO AGRESSIVA (DIETA RIGOROSA) ---
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement("canvas");
          // Reduzimos de 800 para 512px (padrão de IA, super leve)
          const MAX_WIDTH = 512; 
          const scaleSize = MAX_WIDTH / img.width;
          
          if (scaleSize >= 1) {
              canvas.width = img.width;
              canvas.height = img.height;
          } else {
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
          }

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Qualidade 0.6 (60%) - Leve e suficiente para ver cores
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
          setSelectedImage(compressedDataUrl);
        };
      };
    }
  };
  // ------------------------------------------------

  const handleGenerate = async () => {
    if (!idea) return;
    setLoading(true);
    setResult("");

    try {
      // Aumentamos o tempo limite implícito do fetch
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, image: selectedImage }),
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setProgress(100);
      setTimeout(() => {
          setResult(data.result);
          setLoading(false);
      }, 500);

    } catch (error) {
      console.error("Erro:", error);
      alert("Demorou muito ou a imagem é pesada. Tente uma imagem mais simples.");
      setLoading(false);
    }
  };

  const handleClear = () => {
    setIdea("");
    setResult("");
    setSelectedImage(null);
    setProgress(0);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("DevArchitect AI - Documentação do Projeto", 10, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    let bodyText = result;
    bodyText = bodyText.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    bodyText = bodyText.replace(/[#*`]/g, "");

    const keyword = "A Visão do Produto";
    const startIndex = bodyText.indexOf(keyword);
    if (startIndex > -1) {
        bodyText = keyword + bodyText.slice(startIndex + keyword.length);
    }

    const splitText = doc.splitTextToSize(bodyText, 180);
    
    let y = 25;
    splitText.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 10, y);
      y += 5;
    });
    
    doc.save("projeto-completo.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 font-sans selection:bg-indigo-500 selection:text-white">
      <header className="w-full max-w-4xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 text-xl">DA</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">DevArchitect <span className="text-indigo-400">AI</span></h1>
        </div>
        <span className="text-xs bg-indigo-950/50 px-4 py-1.5 rounded-full text-indigo-300 border border-indigo-500/30 flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
          Engine: Gemini 2.5 Pro (Multimodal)
        </span>
      </header>

      <main className="w-full max-w-4xl flex flex-col gap-6">
        
        <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
            {loading && (
                <div className="absolute top-0 left-0 h-1 bg-indigo-900 w-full z-10">
                    <div 
                        className="h-full bg-indigo-400 transition-all duration-500 ease-out shadow-[0_0_10px_#818cf8]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}

            <div className="bg-slate-900 p-6 rounded-xl">
              <label className="block text-sm font-medium text-slate-400 mb-3 ml-1">Descreva sua ideia e anexe referências visuais</label>
              <textarea
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none placeholder-slate-600 leading-relaxed mb-4"
                placeholder="Ex: Quero um site para minha cafeteria. Veja a foto da paleta de cores que eu gosto..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                disabled={loading}
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 6.187l-5.132 5.132" />
                        </svg>
                        {selectedImage ? "Imagem Pronta!" : "Anexar Referência Visual"}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={loading} />
                    </label>

                    {selectedImage && (
                        <div className="relative group">
                            <img src={selectedImage} alt="Preview" className="h-10 w-10 object-cover rounded-md border border-slate-600" />
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                <button 
                    onClick={handleClear}
                    className="text-slate-500 hover:text-red-400 text-sm font-medium px-3 py-2 transition-colors flex items-center gap-2"
                    disabled={loading}
                >
                    Limpar
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !idea}
                  className={`px-8 py-3 rounded-xl font-semibold text-white transition-all flex items-center gap-3 shadow-lg
                    ${loading 
                      ? 'bg-slate-800 cursor-not-allowed text-slate-400' 
                      : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0'}
                  `}
                >
                  {loading ? (
                    <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        {progress < 50 ? 'Analisando...' : 'Escrevendo...'}
                    </>
                  ) : (
                    <>
                        <span>Gerar Projeto</span> 
                        🚀
                    </>
                  )}
                </button>
              </div>
            </div>
        </div>

        {result && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-fade-in mb-10">
            <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex justify-between items-center backdrop-blur-sm sticky top-0 z-20">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                📋 Documentação Final
              </h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => {navigator.clipboard.writeText(result); alert("Texto copiado!");}}
                  className="text-xs font-medium px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition"
                >
                  Copiar
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="text-xs font-medium px-4 py-2 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-900/50 text-indigo-200 rounded-lg transition flex items-center gap-2"
                >
                  Baixar PDF
                </button>
              </div>
            </div>
            
            <div className="p-8 prose prose-invert prose-indigo max-w-none prose-headings:text-indigo-300 prose-a:text-indigo-400 prose-strong:text-white prose-blockquote:border-l-indigo-500 prose-blockquote:bg-slate-800/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}