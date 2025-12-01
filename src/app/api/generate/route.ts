import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// --- CONFIGURAÇÕES PARA EVITAR O ERRO DE TIMEOUT ---
export const maxDuration = 60; // Pede para a Vercel esperar até 60 segundos (o máximo do plano Free)
export const dynamic = 'force-dynamic'; // Garante que não faça cache velho
// --------------------------------------------------

export async function POST(req: Request) {
  try {
    const { idea, image } = await req.json(); 
    
    // --- SUA CHAVE ---
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBcW0JeYfji8fMVFzD4kkG-VoDX5K2jsM8"; 
    // -----------------

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Mantendo a versão latest que você gosta
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest", 
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 5000,
      }
    });

    const systemPrompt = `
      Você é um Consultor de Produtos Digitais e CTO Sênior.
      
      REGRAS CRÍTICAS:
      1. NÃO escreva introduções amigáveis.
      2. NÃO use emojis nos títulos.
      3. Se houver imagem, analise a Identidade Visual.

      ESTRUTURA (Markdown):
      # A Visão do Produto
      (Conceito)
      # Identidade Visual & UX
      (UI/UX baseada na referência ou sugestão moderna)
      # Blueprint Técnico
      (Stack, Banco, Prompt Mestre)
    `;

    const promptParts: any[] = [systemPrompt, `\n\nIdeia do Usuário: ${idea}`];

    if (image) {
      const base64Data = image.split(",")[1];
      promptParts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg", 
        },
      });
    }

    const result = await model.generateContent(promptParts);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    return NextResponse.json({ error: error.message || "Erro de Timeout ou Servidor." }, { status: 500 });
  }
}