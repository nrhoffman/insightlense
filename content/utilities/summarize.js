// Function that passes page content to summarization model
export async function generateSummary(pageContent, focusInput) {

    const maxChar = 3800;
    if (pageContent.length > maxChar) {
        const separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(line => line.split(" ").length - 1 >= 3);
        return await summarizeLargePageContent(separateLines, maxChar, focusInput);
    } else {

        return await summarizePageContent(pageContent, focusInput);
    }
}

// Helper function to summarize the page content in one pass
async function summarizePageContent(pageContent, focusInput) {
    const summarizer = await ai.summarizer.create({ sharedContext: getSummaryContext(focusInput) });
    const summary = await summarizer.summarize(pageContent);
    summarizer.destroy();
    return summary;
}

// Function that breaks web content into sections for summarization
async function summarizeLargePageContent(separateLines, maxChar, focusInput) {
    let pageArray = [];
    let curEl = '';

    const summarizer = await ai.summarizer.create({ sharedContext: getSummaryContext(focusInput) });

    for (const line of separateLines) {
        if ((curEl + line).length < maxChar) {
            curEl += line + '\n';
        } else {

            const summary = await getSummary(summarizer, curEl);
            pageArray.push(summary);
            curEl = line + '\n';
        }
    }

    if (curEl.trim().length > 0) {

        const summary = await getSummary(summarizer, prompt);
        pageArray.push(summary);
    }

    const combinedSummaryInput = pageArray.join('\n');
    const combinedPrompt = `Figure out main topic and summarize into a paragraph: ${combinedSummaryInput.trim()}`;
    const combinedSummary = await getSummary(summarizer, combinedPrompt);
    summarizer.destroy();
    return combinedSummary;
}

// Function that generates the summary
async function getSummary(summarizer, prompt, retries = 10, delay = 1000) {
    let summary = '';
    let attempt = 0;

    while (attempt < retries) {
        try {
            summary = await summarizer.summarize(prompt);
            break;
        } catch (error) {
            console.log(`Error summarizing content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay)); // Exponential backoff
                delay *= 2; // Increase delay for exponential backoff
            } else {
                console.log("Max retries reached. Returning empty summary.");
                summary = "Summary failed after multiple attempts.";
            }
        }
    }

    return summary;
}

// Helper function to get shared context for summarization
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