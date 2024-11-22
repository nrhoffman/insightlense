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
 * @param {number} [retries=3] - Maximum retry attempts for summarization.
 * @param {number} [delay=1000] - Initial delay (in ms) between retry attempts.
 * @returns {Promise<string>} The summary result.
 */
export async function summarizePageContent(pageContent, focusInput, onErrorUpdate, retries = 3, delay = 1000) {
    const session = await createSummarizerSession(focusInput, 4000, true);
    const result = await attemptSummarization(session, pageContent, onErrorUpdate, retries, delay);
    session.destroy();  // Ensure the session is destroyed after use
    return result;
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
    const session = await createSummarizerSession(focusInput, maxChar);
    const sessionCombined = await createSummarizerSession(focusInput, maxChar, true);

    try {
        const chunks = await chunkContent(separateLines, maxChar, session, onErrorUpdate);

        const totalCharSum = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        if (totalCharSum >= maxChar) {
            return await summarizeChunksWithResummarization(chunks, maxChar, sessionCombined, onErrorUpdate);
        }

        return await combineAndSummarizeChunks(chunks, sessionCombined, onErrorUpdate);
    } finally {
        session.destroy();
        sessionCombined.destroy();
    }
}

/**
 * Chunk content into segments based on the maxChar limit.
 *
 * @param {Array<string>} separateLines - Lines of content to chunk.
 * @param {number} maxChar - Maximum character limit per chunk.
 * @param {Object} session - The summarizer session.
 * @param {function} onErrorUpdate - Callback function for error updates.
 * @returns {Promise<Array<string>>} The summarized chunks.
 */
async function chunkContent(separateLines, maxChar, session, onErrorUpdate) {
    let curEl = '';
    const chunks = [];

    for (const line of separateLines) {
        if ((curEl + line).length < maxChar) {
            curEl += line + '\n'; // Add line to current chunk if within limit
        } else {
            chunks.push(await attemptSummarization(session, curEl, onErrorUpdate));
            curEl = line + '\n'; // Start a new chunk
        }
    }

    // Summarize the last chunk
    if (curEl.trim().length > 0) {
        chunks.push(await attemptSummarization(session, curEl, onErrorUpdate));
    }

    return chunks;
}

/**
 * Resummarize chunks if their combined length exceeds maxChar after first summarization.
 *
 * @param {Array<string>} chunks - The chunks to resummarize.
 * @param {number} maxChar - Maximum character limit per segment.
 * @param {Object} session - The summarizer session.
 * @param {function} onErrorUpdate - Callback function for error updates.
 * @returns {Promise<string>} The final summary after resummarizing.
 */
async function summarizeChunksWithResummarization(chunks, maxChar, session, onErrorUpdate) {
    const chunkString = chunks.join('\n');
    const resummarizedChunks = await chunkContent(chunkString.split('\n'), maxChar, session, onErrorUpdate);
    return await combineAndSummarizeChunks(resummarizedChunks, session, onErrorUpdate);
}

/**
 * Combine chunked summaries into one string and summarize.
 *
 * @param {Array<string>} chunks - The chunks to combine and summarize.
 * @param {Object} session - The summarizer session.
 * @param {function} onErrorUpdate - Callback function for error updates.
 * @returns {Promise<string>} The final combined summary.
 */
async function combineAndSummarizeChunks(chunks, session, onErrorUpdate) {
    const combinedSummaryInput = chunks.join('\n');
    return await attemptSummarization(session, combinedSummaryInput.trim(), onErrorUpdate);
}

/**
 * Attempts to summarize content with retry and exponential backoff.
 *
 * @param {Object} session - The summarizer session.
 * @param {string} prompt - Content to summarize.
 * @param {function} onErrorUpdate - Callback function to provide immediate error updates during retries.
 * @param {number} [retries=3] - Maximum retry attempts for summarization.
 * @param {number} [delay=1000] - Initial delay (in ms) between retry attempts.
 * @returns {Promise<string>} The summary of the provided prompt.
 */
async function attemptSummarization(session, prompt, onErrorUpdate, retries = 3, delay = 1000) {
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

            console.warn(`Error summarizing content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {
                await handleRetry(delay);
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
 * @param {number} maxChar - maxChar the summary can be
 * @param {boolean} finalSummary - bool for whether this is a last summary.
 * @returns {Promise<Object>} The summarizer session object.
 */
async function createSummarizerSession(focusInput, maxChar = 4000, finalSummary = false) {
    const context = getSummaryContext(focusInput, maxChar);
    if (finalSummary) return await ai.summarizer.create({ sharedContext: context, type: "tl;dr", format: "plain-text", length: "short" });
    else return await ai.summarizer.create({ sharedContext: context, type: "tl;dr", format: "plain-text", length: "medium" });
    
}

/**
 * Constructs the context string for the summarizer model, incorporating the focus input.
 *
 * @param {string} focusInput - Specific topic or focus area for the summary.
 * @returns {string} The customized context string for summarization.
 */
function getSummaryContext(focusInput, maxChar) {
    return `You must keep under ${maxChar} characters.
            Focus the summary on: "${focusInput}" if not blank.`;
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