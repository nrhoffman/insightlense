// Function to initialize the model
export async function initializeModel(modelInstance, pageContent) {
    try {
        console.log("Initializing model...");

        const maxChar = 3800;
        let result = null;

        // If page content exceeds maxChar, process it in chunks
        if (pageContent.length > maxChar) {
            let curEl = '';
            const separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(line => line.split(" ").length - 1 >= 3);

            for (const line of separateLines) {
                if ((curEl + line).length < maxChar) {
                    curEl += line + '\n';
                } else {
                    if (!modelInstance) {
                        modelInstance = await ai.languageModel.create({ systemPrompt: getPrompt(curEl) });
                    } else {
                        result = await initializeModelSection(modelInstance, curEl);
                    }
                    curEl = line + '\n';
                }
            }

            // Process any remaining content
            if (curEl.trim().length > 0) {
                result = await initializeModelSection(modelInstance, curEl);
            }
        } else {
            // Initialize the model directly with full content if within maxChar
            modelInstance = await ai.languageModel.create({ systemPrompt: getPrompt(pageContent) });
        }
        chrome.runtime.sendMessage({ action: "activateSendButton" });
        chrome.runtime.sendMessage({ action: "activateSummaryButton" });
        console.log("Model Initialized...");
    } catch (error) {
        console.error("Error initializing model:", error);
    }
    return modelInstance;
}

// Helper function that initializes model with another section
async function initializeModelSection(modelInstance, curEl, retries = 10, delay = 1000) {
    let result = '';
    let attempt = 0;

    while (attempt < retries) {
        try {
            result = await modelInstance.prompt(getPrompt(curEl));
            break;
        } catch (error) {
            console.log(`Error initializing content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay)); // Exponential backoff
                delay *= 2; // Increase delay for exponential backoff
            } else {
                console.log("Max retries reached. Returning empty result.");
                result = "Init failed after multiple attempts.";
            }
        }
    }

    return result;
}

// Helper function to get chat bot prompt
function getPrompt(pageContent) {
    return `You are a chatbot that will answer questions about content given.
            Keep responses short.
            Remember enough to answer questions later: ${pageContent}`;
}