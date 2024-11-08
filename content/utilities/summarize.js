/**
 * Generates a summary for page content, splitting it if it exceeds character limits.
 *
 * @param {string} pageContent - The content to be summarized.
 * @param {string} focusInput - Specific topic or focus area for the summary.
 * @returns {Promise<string>} The summarized page content.
 */
export async function generateSummary(pageContent, focusInput) {
    const maxChar = 3800;
    if (pageContent.length > maxChar) {
        const separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(line => line.split(" ").length - 1 >= 3);
        return await summarizeLargePageContent(separateLines, maxChar, focusInput);
    } else {
        return await summarizePageContent(pageContent, focusInput);
    }
}

/**
 * Summarizes page content in one pass if it meets the character limit.
 * Implements retry with exponential backoff on failure.
 *
 * @param {string} pageContent - The content to summarize.
 * @param {string} focusInput - Specific topic or focus area for the summary.
 * @param {number} [retries=10] - Maximum retry attempts for summarization.
 * @param {number} [delay=1000] - Initial delay (in ms) between retry attempts.
 * @returns {Promise<string>} The summary result.
 */
async function summarizePageContent(pageContent, focusInput, retries = 10, delay = 1000) {
    let summary = '';
    let attempt = 0;
    const summarizer = await ai.summarizer.create({ sharedContext: getSummaryContext(focusInput) });

    // Retry logic: Try initializing the model up to the specified number of retries
    while (attempt < retries) {
        try {
            summary = await summarizer.summarize(pageContent);
            break;
        } catch (error) {
            console.log(`Error summarizing content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {
                
                // If retries are left, wait for a certain time before trying again
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else {

                // If the maximum number of retries is reached, return a failure message
                console.log("Max retries reached. Returning empty summary.");
                summary = "Summary failed after multiple attempts.";
            }
        }
    }

    summarizer.destroy();
    return summary;
}

/**
 * Summarizes large page content by breaking it into manageable segments,
 * and combines segment summaries into a final summary.
 *
 * @param {Array<string>} separateLines - Lines of content to process in segments.
 * @param {number} maxChar - Maximum character limit for each segment.
 * @param {string} focusInput - Specific topic or focus area for the summary.
 * @returns {Promise<string>} The combined summary of the segmented content.
 */
async function summarizeLargePageContent(separateLines, maxChar, focusInput) {
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
            const summary = await getSummary(summarizer, curEl);
            pageArray.push(summary);

            // Start a new chunk with the current line
            curEl = line + '\n';
        }
    }

    // Process any remaining content in the last chunk
    if (curEl.trim().length > 0) {
        const summary = await getSummary(summarizer, curEl);
        pageArray.push(summary);
    }

    const combinedSummaryInput = pageArray.join('\n');
    const combinedPrompt = `Figure out main topic and summarize into a paragraph: ${combinedSummaryInput.trim()}`;
    const combinedSummary = await getSummary(summarizer, combinedPrompt);
    summarizer.destroy();
    return combinedSummary;
}

/**
 * Generates a summary for a content segment with retry and exponential backoff.
 *
 * @param {Object} summarizer - The summarizer instance to process the prompt.
 * @param {string} prompt - Content to summarize.
 * @param {number} [retries=10] - Maximum retry attempts for summarization.
 * @param {number} [delay=1000] - Initial delay (in ms) between retry attempts.
 * @returns {Promise<string>} The summary of the provided prompt.
 */
async function getSummary(summarizer, prompt, retries = 10, delay = 1000) {
    let summary = '';
    let attempt = 0;

    // Retry logic: Try initializing the model up to the specified number of retries
    while (attempt < retries) {
        try {
            summary = await summarizer.summarize(prompt);
            break;
        } catch (error) {
            console.log(`Error summarizing content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {

                // If retries are left, wait for a certain time before trying again
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else {

                // If the maximum number of retries is reached, return a failure message
                console.log("Max retries reached. Returning empty summary.");
                summary = "Summary failed after multiple attempts.";
            }
        }
    }

    return summary;
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
