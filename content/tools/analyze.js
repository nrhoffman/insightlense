/**
 * Analyzes the provided page content by interacting with a language model session.
 * Implements a retry mechanism to handle transient errors during the analysis process.
 *
 * @param {string} selectedText - The text to be defined by the language model.
 * @param {function} onErrorUpdate - Callback function to provide immediate error updates during retries.
 * @param {number} [retries=6] - Maximum number of retry attempts for the analysis (default is 6).
 * @param {number} [delay=1000] - Initial delay between retries in milliseconds (default is 1000).
 * @returns {Promise<string>} - The definition of the selected text or an error message if the operation fails.
 */
export async function generateAnalysis(selectedText, onErrorUpdate, retries = 6, delay = 1000) {
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
                        systemPrompt: getAnalysisPrompt(summary) 
                    });
                }

                // Prompt the model
                result = await session.prompt(`Analyze: "${selectedText}"`);
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

            console.log(`Error analyzing content on attempt ${attempt + 1}:`, error);
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
                console.log("Max retries reached. Returning empty analysis.");
                result = "Analysis failed after multiple attempts.";
            }
        }
    }

    return result;
}

/**
 * Generates a prompt for the analysis model based on the provided summary.
 * The prompt is structured to guide the model in producing an analysis with specific categories,
 * such as Sentiment, Emotion, Toxicity, Truthfulness, and Bias.
 *
 * @param {string} summary - The summary of the content to provide context to the model.
 * @returns {string} A formatted prompt that guides the analysis model in structured output.
 */
function getAnalysisPrompt(summary) {
    return `You will be given text to analyze with the given context: ${summary}

            Only use English.
            Ignore text you're not trained on.
            Don't output language you're not trained on.
            Bold Titles.
            Analyze the text and output in this exact format without including what's in parentheses:
                1. Attributes:
                - Sentiment(e.g., Positive, Negative, Neutral): Explanation
                - Emotion(What emotion can be interpreted from the text): Explanation
                - Toxicity(e.g., High, Moderate, Low, None): Explanation
                - Truthfulness(e.g., High, Moderate, Low, Uncertain): Explanation
                - Bias(e.g., High, Moderate, Low, None): Explanation
                
                2. Logical Fallacies: (Identify any logical fallacies present and provide a brief explanation for each)
                - [List of logical fallacies and explanations]
                
                3. Ulterior Motives: (Assess if there are any ulterior motives behind the text and explain)
                - [List of potential ulterior motives]

                4. Overall Analysis: (Provide an overall analysis of the text)
                - [Detailed analysis of the implications and context of the text]
            
            Again: Do NOT include what is in parentheses in the format.
        `;
}