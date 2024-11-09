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
    let result = '';
    let attempt = 0;
    let session = null;

    // Retry logic: Try initializing the model up to the specified number of retries
    while (attempt < retries) {
        try {
            
            // Check availability of model
            const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
            if (available !== "no") {

                // Create model
                if(!session){
                    session = await ai.languageModel.create({
                        systemPrompt: "Give the definition. Keep answers short."
                    });
                }

                // Prompt the model
                result = await session.prompt(`Define: "${selectedText}"`);
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

            console.log(`Error defining content on attempt ${attempt + 1}:`, error);
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
                console.log("Max retries reached. Returning empty definition.");
                result = "Defining failed after multiple attempts.";
            }
        }
    }

    return result;
}