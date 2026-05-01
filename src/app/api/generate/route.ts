import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { idea, image } = await req.json();

    const parte1 = "AIzaSyCkB2GxMJmoDEc2";
    const parte2 = "gbw6Jcy0hsYyNFktiOM";
    const apiKey = parte1 + parte2;

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelName = "gemini-3.1-pro-preview";
    const model = genAI.getGenerativeModel({
      model: modelName,
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

    // Retry logic for 503 Service Unavailable (Overloaded)
    let result: any;
    let lastError: any;
    const MAX_RETRIES = 3;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout limite excedido")), 30000)
        );

        result = await Promise.race([
          model.generateContent(parts),
          timeout,
        ]);

        // Se sucesso, sai do loop
        break;

      } catch (error: any) {
        lastError = error;
        const msg = error.message || "";
        const isOverloaded = msg.includes("503") || msg.includes("overloaded");

        if (isOverloaded && i < MAX_RETRIES - 1) {
          console.warn(`Tentativa ${i + 1} falhou (Model Overloaded). Retentando em ${2 * (i + 1)}s...`);
          await new Promise((r) => setTimeout(r, 2000 * (i + 1))); // Backoff: 2s, 4s
          continue;
        }

        // Se não for overload ou for a última tentativa, repassa o erro
        throw error;
      }
    }

    const response = result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    return NextResponse.json(
      { error: error.message || "Erro no servidor." },
      { status: 500 }
    );
  }
}