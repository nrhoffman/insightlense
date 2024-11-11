/**
 * Fact-checks the provided text using a language model. It initializes a session,
 * applies a context-specific prompt for fact-checking, and returns the result.
 * If the model is unavailable or an error occurs, it handles retries and logs the error.
 *
 * @param {string} selectedText - The text to be fact-checked by the language model.
 * @param {function} onErrorUpdate - Callback function to provide immediate error updates during retries.
 * @param {number} [retries=6] - Maximum number of retry attempts for the analysis (default is 6).
 * @param {number} [delay=1000] - Initial delay between retries in milliseconds (default is 1000).
 * @returns {Promise<string>} - The fact-checked result or an error message if the operation fails.
 */
export async function factCheck(selectedText, onErrorUpdate, retries = 6, delay = 1000) {
    let attempt = 0;
    let session = null;
    const summary = document.getElementById('summary').textContent;

    while (attempt < retries) {
        try {
            // Check availability of model
            const { available } = await ai.languageModel.capabilities();
            if (available === "no") {
                return "Error: Model unavailable. Please restart the browser.";
            }

            // Initialize session if not already done
            if (!session) {
                session = await ai.languageModel.create({ systemPrompt: getFactCheckPrompt(summary) });
            }

            // Fact-check the selected text
            const result = await session.prompt(`Fact Check: "${selectedText}"`);
            session.destroy(); // Clean up session after use
            return result;
        } catch (error) {
            if (onErrorUpdate) {
                onErrorUpdate(`Attempt ${attempt + 1} failed: ${error.message}`);
            }

            console.error(`Error fact-checking content on attempt ${attempt + 1}:`, error);
            attempt++;

            // Retry with exponential backoff
            if (attempt < retries) {
                await handleRetry(delay);
                delay *= 2; // Exponential backoff
            } else {
                if (session) session.destroy(); // Cleanup
                return "Fact check failed after multiple attempts.";
            }
        }
    }
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

/**
 * Handles retry logic, including exponential backoff.
 * 
 * @param {number} delay - The current delay in milliseconds before the next retry.
 */
async function handleRetry(delay) {
    console.log(`Retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
}