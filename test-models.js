const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
    const parte1 = "AIzaSyCkB2GxMJmoDEc2";
    const parte2 = "gbw6Jcy0hsYyNFktiOM";
    const apiKey = parte1 + parte2;

    const genAI = new GoogleGenerativeAI(apiKey);

    const candidates = [
        "gemini-3.1-pro-preview",
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
