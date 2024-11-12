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
        // Split large content and summarize in parts
        const separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(line => line.split(" ").length - 1 >= 3);
        return await summarizeLargePageContent(separateLines, maxChar, focusInput, onErrorUpdate);
    } else {
        // Summarize directly if within character limits
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
 * @param {number} [retries=6] - Maximum retry attempts for summarization.
 * @param {number} [delay=1000] - Initial delay (in ms) between retry attempts.
 * @returns {Promise<string>} The summary result.
 */
export async function summarizePageContent(pageContent, focusInput, onErrorUpdate, retries = 6, delay = 1000) {
    const session = await createSummarizerSession(focusInput);
    return await attemptSummarization(session, pageContent, onErrorUpdate, retries, delay);
}

/**
 * Summarizes large page content by breaking it into manageable segments,
 * and combines segment summaries into a final summary.
 *
 * @param {Array<string>} separateLines - Lines of content to process in segments.
 * @param {number} maxChar - Maximum character limit for each segment.
 * @param {string} focusInput - Specific topic or focus area for the summary.
 * @param {function} onErrorUpdate - Callback function to provide immediate error updates during retries.
 * @returns {Promise<string>} The combined summary of the segmented content.
 */
async function summarizeLargePageContent(separateLines, maxChar, focusInput, onErrorUpdate) {
    const session = await createSummarizerSession(focusInput);
    let pageArray = [];
    let curEl = '';

    for (const line of separateLines) {
        if ((curEl + line).length < maxChar) {
            curEl += line + '\n'; // Add line to current chunk if within limit
        } else {
            // Summarize and start a new chunk when character limit is exceeded
            pageArray.push(await attemptSummarization(session, curEl, onErrorUpdate));
            curEl = line + '\n'; // Start a new chunk
        }
    }

    // Summarize any remaining content in the last chunk
    if (curEl.trim().length > 0) {
        pageArray.push(await attemptSummarization(session, curEl, onErrorUpdate));
    }

    const combinedSummaryInput = pageArray.join('\n');
    return await attemptSummarization(session, `Figure out main topic and summarize into a paragraph: ${combinedSummaryInput.trim()}`, onErrorUpdate);
}

/**
 * Attempts to summarize content with retry and exponential backoff.
 *
 * @param {Object} session - The summarizer session.
 * @param {string} prompt - Content to summarize.
 * @param {function} onErrorUpdate - Callback function to provide immediate error updates during retries.
 * @param {number} [retries=6] - Maximum retry attempts for summarization.
 * @param {number} [delay=1000] - Initial delay (in ms) between retry attempts.
 * @returns {Promise<string>} The summary of the provided prompt.
 */
async function attemptSummarization(session, prompt, onErrorUpdate, retries = 6, delay = 1000) {
    let result = '';
    let attempt = 0;

    while (attempt < retries) {
        try {
            const { available } = await ai.summarizer.capabilities();
            if (available === "no") {
                return "Error: Model unavailable. Please restart the browser.";
            }

            result = await session.summarize(prompt); // Request the summary
            break;
        } catch (error) {
            if (onErrorUpdate) {
                onErrorUpdate(`Attempt ${attempt + 1} failed: ${error.message}\n`);
            }

            console.error(`Error summarizing content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                console.log("Max retries reached. Returning empty summary.");
                result = "Summarizing failed after multiple attempts.";
            }
        }
    }

    return result;
}

/**
 * Creates a summarizer session with the provided focus input.
 *
 * @param {string} focusInput - The topic or focus area for the summary.
 * @returns {Promise<Object>} The summarizer session object.
 */
async function createSummarizerSession(focusInput) {
    const context = getSummaryContext(focusInput);
    return await ai.summarizer.create({ sharedContext: context });
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
