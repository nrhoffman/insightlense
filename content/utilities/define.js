export async function define(selectedText){
    let result = '';
    try {
        const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
        if (available !== "no") {
            let session = null;

            // Fetch result - Further lines format the result properly
            session = await ai.languageModel.create({
                systemPrompt: "Give the definition"
            });
            result = await session.prompt(`Define: "${selectedText}"`);

            session.destroy();
        }
    } catch (error) {
        if (error.message === "Other generic failures occurred.") {
            result = `Other generic failures occurred. Retrying...`;
        }
        else { result = error.message; }
        console.error("Error generating content:", error);
    }

    return result;
}