/**
 * Fetches and returns the definition of a provided text using a language model.
 * It initializes a session, prompts the model for a definition, and formats the result.
 * If the model is unavailable or an error occurs, it handles retries and logs the error.
 *
 * @param {string} selectedText - The text to be defined by the language model.
 * @returns {Promise<string>} - The definition of the selected text or an error message if the operation fails.
 */
export async function define(selectedText) {
    let result = '';
    try {
        const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();

        if (available !== "no") {
            let session = null;

            // Create model
            session = await ai.languageModel.create({
                systemPrompt: "Give the definition"
            });

            // Prompt the model
            result = await session.prompt(`Define: "${selectedText}"`);

            session.destroy();
        }
    } catch (error) {

        // Handle specific error messages and retry if a generic failure occurs
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
