import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { idea, image } = await req.json(); 
    
    // --- SUA CHAVE ---
    const apiKey = "AIzaSyBcW0JeYfji8fMVFzD4kkG-VoDX5K2jsM8"; 
    // -----------------

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // VOLTAMOS PARA A VERSÃO ESTÁVEL (O 'Latest' estava caindo)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro", 
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 5000,
      }
    });

    const systemPrompt = `
      Você é um Consultor de Produtos Digitais e CTO Sênior.
      
      O usuário vai te enviar uma ideia e POSSIVELMENTE uma imagem de referência visual.
      Se houver imagem, ANALISE-A: extraia cores, fontes e estilo.

      REGRAS:
      1. NÃO escreva introduções amigáveis.
      2. NÃO use emojis nos títulos.
      3. Se houver imagem, crie uma seção "Identidade Visual & UX".

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
    // Agora o erro real é enviado para o frontend
    return NextResponse.json({ error: error.message || "Erro interno no servidor do Google." }, { status: 500 });
  }
}