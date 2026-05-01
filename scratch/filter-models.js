const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
    const parte1 = "AIzaSyCkB2GxMJmoDEc2";
    const parte2 = "gbw6Jcy0hsYyNFktiOM";
    const apiKey = parte1 + parte2;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        const models = data.models || [];
        const filtered = models.filter(m => m.name.includes("3.1"));
        console.log(JSON.stringify(filtered, null, 2));
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

main();
