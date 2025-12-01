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

    // --- PROMPT UNIFICADO ---
    // Juntamos as instruções e a ideia do usuário num texto só.
    // Isso evita confusão de "partes" na API.
    const fullPrompt = `
      ATUE COMO: Consultor de Produtos Digitais e CTO Sênior.
      
      REGRAS:
      1. NÃO escreva introduções ("Claro", "Aqui está").
      2. Use Markdown puro.
      3. Se houver imagem anexa, use-a como base para a seção de Identidade Visual.

      ESTRUTURA DE RESPOSTA:
      # A Visão do Produto
      (Conceito)
      # Identidade Visual & UX
      (Estilo, Cores, UX)
      # Blueprint Técnico
      (Stack, Banco, Prompt Mestre)

      PEDIDO DO USUÁRIO: ${idea}
    `;

    // --- LISTA DE CONTEÚDO SIMPLIFICADA ---
    // O SDK aceita strings diretas e objetos de imagem misturados na array.
    const parts: any[] = [fullPrompt];

    if (image) {
      const base64Data = image.split(",")[1];
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg", 
        },
      });
    }

    // Chamada direta: passamos a lista e o SDK formata o JSON corretamente
    const result = await model.generateContent(parts);
    
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    return NextResponse.json({ error: error.message || "Erro no servidor." }, { status: 500 });
  }
}