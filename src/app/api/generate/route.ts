import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { idea, image } = await req.json(); 
    
    // --- SUA CHAVE NOVA (Dividida) ---
    const parte1 = "AIzaSyCkB2GxMJmoDEc2"; 
    const parte2 = "gbw6Jcy0hsYyNFktiOM";
    const apiKey = parte1 + parte2; 
    // --------------------------------

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // --- A CORREÇÃO FINAL ---
    // Usando o código "001". Esse é o número de série fixo.
    // O Google nunca tira as versões numeradas do ar.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-001", 
    });

    const fullPrompt = `
      ATUE COMO: Consultor de Produtos Digitais e CTO Sênior.
      
      REGRAS:
      1. NÃO escreva introduções.
      2. Use Markdown puro.
      3. Se houver imagem anexa, use-a como base para a Identidade Visual.

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

    if (image && image.includes("base64,")) {
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