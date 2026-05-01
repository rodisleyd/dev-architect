const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
    const parte1 = "AIzaSyCkB2GxMJmoDEc2";
    const parte2 = "gbw6Jcy0hsYyNFktiOM";
    const apiKey = parte1 + parte2;

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Listing models for API Key...");
        // Use the underlying client or a generic request if possible
        // Actually, the SDK doesn't have a direct listModels in the main class easily?
        // Let's use a raw fetch if possible or check docs.
        // In v1beta, it's GET https://generativelanguage.googleapis.com/v1beta/models?key=...
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

main();
