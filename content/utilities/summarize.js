/**
 * Generates a summary for page content, splitting it if it exceeds character limits.
 *
 * @param {string} pageContent - The content to be summarized.
 * @param {string} focusInput - Specific topic or focus area for the summary.
 * @param {function} onErrorUpdate - Callback function to provide immediate error updates during retries.
 * @returns {Promise<string>} The summarized page content.
 */
export async function generateSummary(pageContent, focusInput, onErrorUpdate) {
    const maxChar = 3800;
    if (pageContent.length > maxChar) {
        const separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(line => line.split(" ").length - 1 >= 3);
        return await summarizeLargePageContent(separateLines, maxChar, focusInput, onErrorUpdate);
    } else {
        return await summarizePageContent(pageContent, focusInput, onErrorUpdate);
    }
}

/**
 * Summarizes page content in one pass if it meets the character limit.
 * Implements retry with exponential backoff on failure.
 *
 * @param {string} pageContent - The content to summarize.
 * @param {string} focusInput - Specific topic or focus area for the summary.
 * @param {function} onErrorUpdate - Callback function to provide immediate error updates during retries.
 * @param {number} [retries=10] - Maximum retry attempts for summarization.
 * @param {number} [delay=1000] - Initial delay (in ms) between retry attempts.
 * @returns {Promise<string>} The summary result.
 */
export async function summarizePageContent(pageContent, onErrorUpdate, retries = 10, delay = 1000) {
    let result = '';
    let attempt = 0;
    let session = null;

    // Retry logic: Try initializing the model up to the specified number of retries
    while (attempt < retries) {
        try {
            
            // Check availability of model
            const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.summarizer.capabilities();
            if (available !== "no") {

                // Create model
                if(!session){
                    session = await ai.summarizer.create({
                        sharedContext: getSummaryContext(focusInput)
                    });
                }

                // Prompt the model
                result = await session.summarize(pageContent);
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

            console.log(`Error summarizing content on attempt ${attempt + 1}:`, error);
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
                console.log("Max retries reached. Returning empty summary.");
                result = "Summarizing failed after multiple attempts.";
            }
        }
    }

    return result;
}

/**
 * Summarizes large page content by breaking it into manageable segments,
 * and combines segment summaries into a final summary.
 *
 * @param {Array<string>} separateLines - Lines of content to process in segments.
 * @param {number} maxChar - Maximum character limit for each segment.
 * @param {string} focusInput - Specific topic or focus area for the summary.
 * @returns {Promise<string>} The combined summary of the segmented content.
 * @param {function} onErrorUpdate - Callback function to provide immediate error updates during retries.
 */
async function summarizeLargePageContent(separateLines, maxChar, focusInput, onErrorUpdate) {
    let pageArray = [];
    let curEl = '';
    const summarizer = await ai.summarizer.create({ sharedContext: getSummaryContext(focusInput) });

    // Iterate through the content lines and chunk them based on the character limit
    for (const line of separateLines) {
        if ((curEl + line).length < maxChar) {

            // If adding the line doesn't exceed the character limit, add it to the current chunk
            curEl += line + '\n';
        } else {

            // Process the current chunk
            const summary = await getSummary(summarizer, curEl, onErrorUpdate);
            pageArray.push(summary);

            // Start a new chunk with the current line
            curEl = line + '\n';
        }
    }

    // Process any remaining content in the last chunk
    if (curEl.trim().length > 0) {
        const summary = await getSummary(summarizer, curEl, onErrorUpdate);
        pageArray.push(summary);
    }

    const combinedSummaryInput = pageArray.join('\n');
    const combinedPrompt = `Figure out main topic and summarize into a paragraph: ${combinedSummaryInput.trim()}`;
    const combinedSummary = await getSummary(summarizer, combinedPrompt, onErrorUpdate);
    summarizer.destroy();
    return combinedSummary;
}

/**
 * Generates a summary for a content segment with retry and exponential backoff.
 *
 * @param {Object} summarizer - The summarizer instance to process the prompt.
 * @param {string} prompt - Content to summarize.
 * @param {function} onErrorUpdate - Callback function to provide immediate error updates during retries.
 * @param {number} [retries=10] - Maximum retry attempts for summarization.
 * @param {number} [delay=1000] - Initial delay (in ms) between retry attempts.
 * @returns {Promise<string>} The summary of the provided prompt.
 */
export async function getSummary(session, prompt, onErrorUpdate, retries = 10, delay = 1000) {
    let result = '';
    let attempt = 0;

    // Retry logic: Try initializing the model up to the specified number of retries
    while (attempt < retries) {
        try {
            
            // Check availability of model
            const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.summarizer.capabilities();
            if (available !== "no") {

                // Prompt the model
                result = await session.summarize(prompt);
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

            console.log(`Error summarizing content on attempt ${attempt + 1}:`, error);
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
                console.log("Max retries reached. Returning empty summary.");
                result = "Summarizing failed after multiple attempts.";
            }
        }
    }

    return result;
}

/**
 * Constructs the context string for the summarizer model, incorporating the focus input and domain.
 *
 * @param {string} focusInput - Specific topic or focus area for the summary.
 * @returns {string} The customized context string for summarization.
 */
function getSummaryContext(focusInput) {
    const domain = window.location.hostname;
    return `Domain content is coming from: ${domain}.
            Mention where the content is coming from using domain provided.
            Only output in English.
            Only output in trained format and language.
            Use paragraph form.
            Only summarize the content.
            Keep the summary short.
            Focus the summary on: "${focusInput}" if not blank.`;
}
