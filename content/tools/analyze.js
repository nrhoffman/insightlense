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
    let attempt = 0;
    let session = null;
    const summary = document.getElementById('summary').textContent;

    while (attempt < retries) {
        try {
            // Ensure the model is available before creating a session
            const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
            if (available === "no") {
                return "Error: Model unavailable. Please restart the browser.";
            }

            // Create session if it doesn't exist
            if (!session) {
                session = await createSession(summary);
            }

            // Prompt the model for analysis
            const result = await analyzeText(session, selectedText);
            session.destroy(); // Clean up session after use
            return result; // Return successful result
        } catch (error) {
            // Immediately report error during retry attempts
            if (onErrorUpdate) {
                onErrorUpdate(`Attempt ${attempt + 1} failed: ${error.message}`);
            }

            // Log error for debugging purposes
            console.warn(`Error on attempt ${attempt + 1}: ${error.message}`);

            // Increment retry attempt and apply exponential backoff
            attempt++;
            if (attempt < retries) {
                await handleRetry(delay);
                delay *= 2; // Exponential backoff
            } else {
                // Clean up if all retry attempts fail
                if (session) {
                    session.destroy();
                }
                return "Analysis failed after multiple attempts.";
            }
        }
    }
}

/**
 * Creates a new session for the analysis.
 * @param {string} summary - The summary of the content to provide context to the model.
 * @returns {Promise<Object>} - The created model session.
 */
async function createSession(summary) {
    try {
        return await ai.languageModel.create({
            systemPrompt: getAnalysisPrompt(summary)
        });
    } catch (error) {
        throw new Error(`Failed to create analysis session: ${error.message}`);
    }
}

/**
 * Analyzes the selected text using the provided session.
 * @param {Object} session - The session to use for prompting the language model.
 * @param {string} selectedText - The text to be analyzed.
 * @returns {Promise<string>} - The analysis result.
 */
async function analyzeText(session, selectedText) {
    try {
        const result = await session.prompt(`Analyze: "${selectedText}"`);
        return result;
    } catch (error) {
        throw new Error(`Error while analyzing text: ${error.message}`);
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

/**
 * Generates a prompt for the analysis model based on the provided summary.
 * The prompt is structured to guide the model in producing an analysis with specific categories,
 * such as Sentiment, Emotion, Toxicity, Truthfulness, and Bias.
 *
 * @param {string} summary - The summary of the content to provide context to the model.
 * @returns {string} A formatted prompt that guides the analysis model in structured output.
 */
function getAnalysisPrompt(summary) {
    return `You will be given text to analyze.
            Use this content if given: ${summary}

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
