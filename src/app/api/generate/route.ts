import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { idea, image } = await req.json(); 
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("Chave de API não configurada.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Usando o Flash (Rápido e Estável)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
    });

    const systemPrompt = `
      Você é um Consultor de Produtos Digitais e CTO Sênior.
      REGRAS:
      1. NÃO escreva introduções.
      2. Markdown puro.
      3. Analise visualmente se houver imagem.

      ESTRUTURA:
      # A Visão do Produto
      # Identidade Visual & UX
      # Blueprint Técnico
    `;

    // --- A CORREÇÃO ESTÁ AQUI ---
    // A API nova exige que o texto esteja dentro de um objeto { text: "..." }
    const promptParts: any[] = [
      { text: systemPrompt }, 
      { text: `\n\nIdeia do Usuário: ${idea}` }
    ];

    if (image) {
      const base64Data = image.split(",")[1];
      promptParts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg", 
        },
      });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: promptParts }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 5000,
      }
    });
    
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    return NextResponse.json({ error: error.message || "Erro no servidor." }, { status: 500 });
  }
}