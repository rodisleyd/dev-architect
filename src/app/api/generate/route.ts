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
    
    // --- VERSÃO ESTÁVEL E SEGURA ---
    // Esta versão é Multimodal (lê imagens) e muito inteligente.
    // É a única que o Google garante disponibilidade 100% no plano gratuito hoje.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", 
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 5000,
      }
    });

    const systemPrompt = `
      Você é um Consultor de Produtos Digitais e CTO Sênior.
      REGRAS CRÍTICAS:
      1. NÃO escreva introduções.
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
    return NextResponse.json({ error: error.message || "Erro no servidor." }, { status: 500 });
  }
}