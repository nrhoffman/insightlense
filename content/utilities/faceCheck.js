/**
 * Fact-checks the provided text using a language model. It initializes a session,
 * applies a context-specific prompt for fact-checking, and returns the result.
 * If the model is unavailable or an error occurs, it handles retries and logs the error.
 *
 * @param {string} selectedText - The text to be fact-checked by the language model.
 * @returns {Promise<string>} - The result of the fact-check, including the outcome and an explanation,
 *                               or an error message if the operation fails.
 */
export async function factCheck(selectedText) {

    // Fetch the content of the summary element to use as context for fact-checking
    const summary = document.getElementById('summary').textContent;
    let result = '';
    
    try {
        const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();

        if (available !== "no") {
            let session = null;

            // Create a new model
            session = await ai.languageModel.create({
                systemPrompt: getFactCheckPrompt(summary)
            });

            result = await session.prompt(`Fact Check: "${selectedText}"`);

            session.destroy();
        }
    } catch (error) {

        // Handle specific error messages and provide feedback for generic failures
        if (error.message === "Other generic failures occurred.") {
            result = `Other generic failures occurred. Retrying...`;
        } 
        else {

            // Capture and return any other error message
            result = error.message;
        }
        console.error("Error generating content:", error);
    }

    return result;
}

/**
 * Generates a system prompt for fact-checking based on the given summary context.
 * The prompt specifies strict instructions on output format and constraints.
 *
 * @param {string} summary - Context for the fact-checking operation, typically from a summary of related information.
 * @returns {string} - The constructed system prompt to guide the model's fact-checking output.
 */
function getFactCheckPrompt(summary) {
    return `You will be given text to fact-check with the given context: ${summary}

            Only use English.
            Ignore text you're not trained on.
            Don't output language you're not trained on.
            Bold Titles.
            Fact check the text and output in this exact format without including what's in parentheses:
                Fact Check Result: (True, Partially True, False, Unverified, Opinion)

                Explanation: (Give an explanation of the fact check)
            
            Again: Do NOT include what is in parentheses in the format.
        `;
}
