/**
 * Initializes the model with the provided page content.
 * If the content exceeds the maximum character limit, it processes the content in chunks.
 * Otherwise, the model is initialized directly with the entire content.
 *
 * @param {Object} modelInstance - The existing model instance (if any).
 * @param {string} pageContent - The content of the page to initialize the model with.
 * @returns {Object} The initialized model instance.
 */
export async function initializeModel(modelInstance, pageContent) {
    try {
        console.log("Initializing model...");

        const maxChar = 3800;
        let result = null;

        // If the page content exceeds the maximum character limit, process it in chunks
        if (pageContent.length > maxChar) {

            // Temporary string to accumulate chunks of content
            let curEl = '';

            // Split content into lines and remove empty or too short lines
            const separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(line => line.split(" ").length - 1 >= 3);

            // Iterate through the content lines and chunk them based on the character limit
            for (const line of separateLines) {
                if ((curEl + line).length < maxChar) {

                    // If adding the line doesn't exceed the character limit, add it to the current chunk
                    curEl += line + '\n';
                } else {

                    // If the chunk exceeds the character limit, initialize or reuse the model
                    if (!modelInstance) {
                        modelInstance = await ai.languageModel.create({ systemPrompt: getPrompt(curEl) });
                    } else {

                         // Process the current chunk
                        modelInstance = await initializeModelSection(modelInstance, curEl);
                    }

                    // Start a new chunk with the current line
                    curEl = line + '\n';
                }
            }

            // Process any remaining content in the last chunk
            if (curEl.trim().length > 0) {
                modelInstance = await initializeModelSection(modelInstance, curEl);
            }
        } else {

            // If content is within the character limit, initialize the model with the full content
            modelInstance = await ai.languageModel.create({ systemPrompt: getPrompt(pageContent) });
        }

        console.log("Model Initialized...");
    } catch (error) {
        console.error("Error initializing model:", error);
    }

    return modelInstance;
}

/**
 * Initializes the model with a specific section of content.
 * This function includes retry logic with exponential backoff to handle transient errors.
 *
 * @param {Object} modelInstance - The existing model instance to be used for initialization.
 * @param {string} curEl - The current section of content to initialize the model with.
 * @param {number} [retries=10] - The number of retry attempts in case of failure (default is 10).
 * @param {number} [delay=1000] - The initial delay between retries in milliseconds (default is 1000).
 * @returns {string} The result of the initialization attempt, or an error message if all retries fail.
 */
async function initializeModelSection(modelInstance, curEl, retries = 10, delay = 1000) {
    let result = '';
    let attempt = 0;

    // Retry logic: Try initializing the model up to the specified number of retries
    while (attempt < retries) {
        try {
            
            // Attempt to initialize the model with the current chunk of content
            result = await modelInstance.prompt(getPrompt(curEl));
            break;
        } catch (error) {
            console.log(`Error initializing content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {

                // If retries are left, wait for a certain time before trying again
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else {

                // If the maximum number of retries is reached, return a failure message
                console.log("Max retries reached. Returning empty result.");
            }
        }
    }

    return modelInstance;
}

/**
 * Constructs the prompt to be used for the chatbot model.
 * The prompt includes the page content and instructions for the chatbot.
 *
 * @param {string} pageContent - The content to be included in the prompt.
 * @returns {string} The constructed prompt for the chatbot, including instructions.
 */
function getPrompt(pageContent) {
    return `You are a chatbot that will answer questions about content given.
            Keep responses short.
            Remember enough to answer questions later: ${pageContent}`;
}