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
    
    // --- MUDANÇA TÉCNICA ---
    // Em vez de usar o apelido genérico, usamos a versão específica "001".
    // Isso evita o erro 404 em servidores que não atualizaram os apelidos ainda.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-001", 
    });

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

    const result = await model.generateContent(parts);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    return NextResponse.json({ error: error.message || "Erro no servidor." }, { status: 500 });
  }
}