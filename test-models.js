const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
    const apiKey = "AIzaSyC6485MTXY2ppFt1w8jLPwjul_rXQLMY98";

    const genAI = new GoogleGenerativeAI(apiKey);

    const candidates = [
        "gemini-1.5-flash",
        "gemini-3.1-flash-lite-preview",
        "gemini-3.1-pro-preview",
        "gemini-3.1-flash-preview",
        "gemini-3.1-flash",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-flash-latest"
    ];

    console.log("Testing specific models for API Key: " + apiKey.substring(0, 5) + "...");

    for (const modelName of candidates) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            console.log("SUCCESS! ✅");
        } catch (e) {
            console.log(`FAILED ❌`);
            console.log(`Error Message: ${e.message}`);
        }
    }
}

main();
