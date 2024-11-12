/**
 * Fetches and returns the definition of a provided text using a language model.
 * It initializes a session, prompts the model for a definition, and formats the result.
 * If the model is unavailable or an error occurs, it handles retries and logs the error.
 *
 * @param {string} selectedText - The text to be defined by the language model.
 * @param {function} onErrorUpdate - Callback function to provide immediate error updates during retries.
 * @param {number} [retries=6] - Maximum number of retry attempts for the analysis (default is 6).
 * @param {number} [delay=1000] - Initial delay between retries in milliseconds (default is 1000).
 * @returns {Promise<string>} - The definition of the selected text or an error message if the operation fails.
 */
export async function define(selectedText, onErrorUpdate, retries = 6, delay = 1000) {
    let attempt = 0;
    let session = null;
    const systemPrompt = "Give the definition. Keep answers short.";

    while (attempt < retries) {
        try {
            // Ensure the model is available before creating a session
            const { available } = await ai.languageModel.capabilities();
            if (available === "no") {
                return "Error: Model unavailable. Please restart the browser.";
            }

            // Create session if it doesn't exist
            if (!session) {
                session = await ai.languageModel.create({ systemPrompt });
            }

            // Prompt the model for definition
            const result = await session.prompt(`Define: "${selectedText}"`);
            session.destroy(); // Clean up session after use
            return result; // Return successful result
        } catch (error) {
            // Immediately report error during retry attempts
            if (onErrorUpdate) {
                onErrorUpdate(`Attempt ${attempt + 1} failed: ${error.message}`);
            }

            // Log error for debugging purposes
            console.error(`Error defining content on attempt ${attempt + 1}:`, error);

            // Increment retry attempt and apply exponential backoff
            attempt++;
            if (attempt < retries) {
                await handleRetry(delay);
                delay *= 2; // Exponential backoff
            } else {
                // Clean up if all retry attempts fail
                if (session) session.destroy();
                return "Defining failed after multiple attempts.";
            }
        }
    }
}

/**
 * Handles retry logic, including applying an exponential backoff delay.
 * @param {number} delay - The current delay in milliseconds.
 */
async function handleRetry(delay) {
    console.log(`Retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
}