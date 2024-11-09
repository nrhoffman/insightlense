/**
 * Fact-checks the provided text using a language model. It initializes a session,
 * applies a context-specific prompt for fact-checking, and returns the result.
 * If the model is unavailable or an error occurs, it handles retries and logs the error.
 *
 * @param {string} selectedText - The text to be defined by the language model.
 * @param {function} onErrorUpdate - Callback function to provide immediate error updates during retries.
 * @param {number} [retries=6] - Maximum number of retry attempts for the analysis (default is 6).
 * @param {number} [delay=1000] - Initial delay between retries in milliseconds (default is 1000).
 * @returns {Promise<string>} - The definition of the selected text or an error message if the operation fails.
 */
export async function factCheck(selectedText, onErrorUpdate, retries = 6, delay = 1000) {
    let result = '';
    let attempt = 0;
    let session = null;

    // Fetch the content of the summary element to use as context for fact-checking
    const summary = document.getElementById('summary').textContent;

    // Retry logic: Try initializing the model up to the specified number of retries
    while (attempt < retries) {
        try {
            
            // Check availability of model
            const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
            if (available !== "no") {

                // Create model
                if(!session){
                    session = await ai.languageModel.create({
                        systemPrompt: getFactCheckPrompt(summary)
                    });
                }

                // Prompt the model
                result = await session.prompt(`Fact Check: "${selectedText}"`);
                session.destroy();
                break;
            }
            else {
                return "Error: Model Crashed... Restart browser."
            }
        } catch (error) {
            
            // Report error immediately to the caller
            if (onErrorUpdate) {
                onErrorUpdate(`Attempt ${attempt + 1} failed: ${error.message}\n`);
            }

            console.log(`Error fact checking content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {

                // If retries are left, wait for a certain time before trying again
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } 
            else {
    
                //Cleanup
                if (session) session.destroy();
    
                // If the maximum number of retries is reached, return a failure message
                console.log("Max retries reached. Returning empty fact check.");
                result = "Fact check failed after multiple attempts.";
            }
        }
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
