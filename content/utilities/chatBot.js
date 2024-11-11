class ChatBot {
    constructor() {
        this.initialized = false; // Indicates if the model has been initialized
        this.initializing = false; // Indicates if the model is currently initializing
        this.modelInstance = null; // Holds the instance of the language model
    }

    /**
     * Checks if the model has been initialized.
     * @returns {boolean} - True if initialized, false otherwise.
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Checks if the model is currently initializing.
     * @returns {boolean} - True if initializing, false otherwise.
     */
    isInitializing() {
        return this.initializing;
    }

    /**
     * Initializes the chatbot model with the provided page content.
     * Splits the content into chunks if it exceeds the character limit and processes each chunk.
     * @param {string} pageContent - The content of the page to initialize the model with.
     */
    async initializeModel(pageContent) {
        if (this.initializing) {
            console.warn("Model is already initializing. Please wait.");
            return;
        }

        try {
            this.initializing = true;
            console.log("Initializing model...");

            const maxChar = 3800; // Maximum character limit for each model input

            // If the page content exceeds the max character limit, process it in chunks
            if (pageContent.length > maxChar) {
                let curEl = '';
                const separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(line => line.split(" ").length - 1 >= 3);

                for (const line of separateLines) {
                    if ((curEl + line).length < maxChar) {
                        curEl += line + '\n';
                    } else {
                        // Initialize or reuse the model for each chunk of content
                        if (!this.modelInstance) {
                            this.modelInstance = await ai.languageModel.create({ systemPrompt: this.getPrompt(curEl) });
                        } else {
                            await this.initializeModelSection(curEl);
                        }
                        curEl = line + '\n';
                    }
                }

                if (curEl.trim().length > 0) {
                    await this.initializeModelSection(curEl);
                }
            } else {
                // If content is within the character limit, initialize the model with the full content
                this.modelInstance = await ai.languageModel.create({ systemPrompt: this.getPrompt(pageContent) });
            }
        } catch (error) {
            console.error("Error initializing model:", error);
        } finally {
            this.initialized = true;
            this.initializing = false;
            console.log("Model Initialized...");
        }
    }

    /**
     * Initializes the model with a specific chunk of content, with retry logic.
     * @param {string} curEl - The current chunk of content to initialize the model with.
     * @param {number} retries - Number of retry attempts (default is 6).
     * @param {number} delay - Delay between retries in milliseconds (default is 1000ms).
     */
    async initializeModelSection(curEl, retries = 6, delay = 1000) {
        let attempt = 0;

        while (attempt < retries) {
            try {
                await this.modelInstance.prompt(this.getPrompt(curEl));
                break;
            } catch (error) {
                console.error(`Error initializing content on attempt ${attempt + 1}:`, error);
                attempt++;
                if (attempt < retries) {
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    console.error("Max retries reached. Model section initialization failed.");
                }
            }
        }
    }

    /**
     * Generates a prompt to initialize the model with the given content.
     * @param {string} pageContent - The content to include in the prompt.
     * @returns {string} - The generated prompt string.
     */
    getPrompt(pageContent) {
        return `You are a chatbot that will answer questions about content given.
                Keep responses short and only respond in English and trained formats/language.
                Remember enough to answer questions later: ${pageContent}`;
    }

    /**
     * Retrieves output from the chatbot model for a given input, with retry logic.
     * @param {string} input - The user's input for the chatbot.
     * @param {number} retries - Number of retry attempts (default is 10).
     * @param {number} delay - Delay between retries in milliseconds (default is 1000ms).
     * @returns {string} - The chatbot's output.
     */
    async getChatBotOutput(input, retries = 10, delay = 1000) {
        let result = '';
        let attempt = 0;

        if (this.modelInstance) {
            while (attempt < retries) {
                try {
                    result = await this.modelInstance.prompt(input);
                    return result;
                } catch (error) {
                    console.error(`Error retrieving output on attempt ${attempt + 1}:`, error);
                    attempt++;
                    if (attempt < retries) {
                        console.log(`Retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= 2; // Exponential backoff
                    } else {
                        console.error("Max retries reached. Returning empty result.");
                        return "I'm sorry, I couldn't process that request.";
                    }
                }
            }
        } else {
            console.error("Model not initialized.");
            return "The model is not yet initialized.";
        }
    }

    /**
     * Destroys the model instance to release resources.
     */
    destroyModel() {
        if (this.modelInstance) {
            console.log("Destroying model instance...");
            this.modelInstance.destroy();
            this.modelInstance = null;
        } else {
            console.warn("Model instance not found.");
        }
    }
}

export default ChatBot;