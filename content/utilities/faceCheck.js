export async function factCheck(selectedText){
    const summary = document.getElementById('summary').textContent;
    let result = '';
    try {
        const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
        if (available !== "no") {
            let session = null;

            // Fetch result - Further lines format the result properly
            session = await ai.languageModel.create({
                systemPrompt: getFactCheckPrompt(summary)
            });
            result = await session.prompt(`Fact Check: "${selectedText}"`);

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

function getFactCheckPrompt(summary) {
    return `You will be given text to fact-check with the given context: ${summary}

            Only use English.
            Ignore text you're not trained on.
            Don't output language you're not trained on.
            Bold Titles.
            Fact check the text and output in this exact format without including what's in parantheses:
                Fact Check Result: (True, Partially True, False, Unverified, Opinion)

                Explanation: (Give an explanation of the fact check)
            
            Again: Do NOT include what is in parantheses in the format.
        `;
}