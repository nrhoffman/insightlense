import ChatBot from './utilities/chatBot.js';
import { clearExpiredStorage } from './utilities/clearExpiredStorage.js'
import ExtensionState from './state/extensionState.js'
import { formatTextResponse } from './utilities/formatTextResponse.js';
import { generateDefinition } from './tools/define.js';
import { generateFactCheck } from './tools/factCheck.js';
import { generateAnalysis } from './tools/analyze.js';
import { generateSummary } from './tools/summarize.js';
import { handleContextMenuAction } from './utilities/handleContextMenuAction.js'
import StatusStateMachine from './state/statusStateMachine.js';

console.log("Background worker started!");

const REMOVE_SCHEDULE_MS = 12 * 60 * 60 * 1000; // Interval to clear expired storage (12 hours)

// Singleton instance
const extensionState = new ExtensionState();

setInterval(clearExpiredStorage, REMOVE_SCHEDULE_MS); // Periodic storage cleanup
clearExpiredStorage(REMOVE_SCHEDULE_MS); // Initial cleanup on startup

// Event listener for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.");
    createContextMenus(); // Setup context menu options
});

// Event listener for context menu item clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
        handleContextMenuAction(info, tab); // Perform the selected action
    } catch (error) {
        console.error("Error handling context menu action:", error);
    }
});

// Event listener for tab closure to clean up resources
chrome.tabs.onRemoved.addListener((tabId) => {
    extensionState.cleanUpTab(tabId);
    console.log(`Cleaned up resources for tab ${tabId}`);
});

// Listener for messages from popup or content scripts
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    try {
        let url;
        let tabId;
        switch (request.action) {
            case 'initExtension':
                tabId = sender.tab.id;
                url = sender.tab.url;
                await injectScriptsAndStyles(tabId); // Ensure content scripts/styles are injected
                chrome.tabs.sendMessage(tabId, { action: "showSidebar" });
                if (!extensionState.hasStatus(tabId) || extensionState.getStatus(tabId).pageUrl !== url) {
                    extensionState.setStatus(tabId, new StatusStateMachine(url));
                }
                break;
            case 'initChatBot':
                tabId = sender.tab.id;
                url = sender.tab.url;
                await new Promise(r => setTimeout(r, 3000));
                await initializeExtension(tabId, request.pageContent, url);
                break;
            case 'getStatuses':
                url = request.url;
                const statusToSend = await getCurrentStatuses(request.tabId, url);
                chrome.runtime.sendMessage({ action: "sendStatus", status: statusToSend });
                break;
            case 'summarizeContent':
                if (!extensionState.getStatus(request.tabId).isRunning("summarizing")) {
                    const generatedSummary = await summarizeContent(request.tabId, request.focusInput, request.pageContent);
                    chrome.tabs.sendMessage(request.tabId, { action: "sendGeneratedSummary", summary: generatedSummary });
                    chrome.runtime.sendMessage({ action: "activateButtons" }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.warn("Popup is not open:", chrome.runtime.lastError.message);
                        }
                    });
                }
                break;
            case 'getChatBotOutput':
                const outputToSend = await getChatBotOutput(request.chatInput, request.tabId);
                chrome.runtime.sendMessage({ action: "setChatBotOutput", output: outputToSend });
                break;
            case 'analyzeContent':
                tabId = sender.tab.id;
                if (!extensionState.getStatus(tabId).isRunning("analyzing")) {
                        const generatedAnalysis= await analyzeContent(tabId, request.pageContent, request.summary);
                        chrome.tabs.sendMessage(tabId, { action: "sendGeneratedAnalysis", analysis: generatedAnalysis });
                        chrome.runtime.sendMessage({ action: "activateButtons" }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.warn("Popup is not open:", chrome.runtime.lastError.message);
                            }
                        });
                }
                break;
            case 'factCheckContent':
                tabId = sender.tab.id;
                if (!extensionState.getStatus(tabId).isRunning("factChecking")) {
                        const generatedFactCheck = await factCheckContent(tabId, request.pageContent, request.summary);
                        chrome.tabs.sendMessage(tabId, { action: "sendGeneratedFactCheck", factCheck: generatedFactCheck });
                        chrome.runtime.sendMessage({ action: "activateButtons" }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.warn("Popup is not open:", chrome.runtime.lastError.message);
                            }
                        });
                }
                break;
            case 'defineContent':
                tabId = sender.tab.id;
                if (!extensionState.getStatus(tabId).isRunning("defining")) {
                        const generatedDefinition = await defineContent(tabId, request.pageContent, request.summary);
                        chrome.tabs.sendMessage(tabId, { action: "sendGeneratedDefinition", define: generatedDefinition });
                        chrome.runtime.sendMessage({ action: "activateButtons" }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.warn("Popup is not open:", chrome.runtime.lastError.message);
                            }
                        });
                }
                break;
            case 'startRewriting':
                tabId = sender.tab.id;
                extensionState.getStatus(tabId).stateChange("rewriting", true);
                break;
            case 'stopRewriting':
                tabId = sender.tab.id;
                extensionState.getStatus(tabId).stateChange("rewriting", false);
                chrome.runtime.sendMessage({ action: "activateButtons" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.warn("Popup is not open:", chrome.runtime.lastError.message);
                    }
                });
                break;
            default:
                console.warn("Unknown action:", request.action);
        }
    } catch (error) {
        console.error("Error processing message:", error);
    }
});

// Log the initial local storage state
chrome.storage.local.get(null, (result) => {
    console.log("Current Local Storage:", result);
});

/**
 * Creates the context menu items for the extension.
 */
function createContextMenus() {
    const menuItems = [
        { id: "define", title: "Define" },
        { id: "factCheck", title: "Fact-Check" },
        { id: "analyze", title: "Analyze" },
        { id: "rewrite", title: "Rewrite" }
    ];

    menuItems.forEach(({ id, title }) => {
        chrome.contextMenus.create({ id, title, contexts: ["selection"] });
    });
}

/**
 * Initializes the extension
 * 
 * @param {number} tabId - The ID of the tab.
 * @param {string} pageContent - The content of the current page.
 * @param {string} url - The normalized URL of the current page.
 */
async function initializeExtension(tabId, pageContent, url) {
    if (!extensionState.hasStatus(tabId) || extensionState.getStatus(tabId).pageUrl !== url) {
        extensionState.setStatus(tabId, new StatusStateMachine(url));
    }

    let chatbot = extensionState.getChatModel(tabId);

    // If there's no chatbot or the URL has changed, create a new one
    if (!chatbot || chatbot.pageUrl !== url) {
        chatbot = new ChatBot(url);
        extensionState.setChatModel(tabId, chatbot);
        console.log(`Chat model updated for tab ${tabId} with URL ${url}`);
    }

    // Prevent re-initializing an already initializing or initialized ChatBot
    if (chatbot.isInitializing()) {
        console.log(`ChatBot is already initializing for tab ${tabId}`);
        return;
    }

    if (chatbot.isInitialized()) {
        console.log(`ChatBot is already initialized for tab ${tabId}`);
        return;
    }

    // Mark chatbot as initializing and initialize it
    try {
        await chatbot.initializeModel(pageContent);
        console.log(`ChatBot initialized for tab ${tabId}`);
    } catch (error) {
        console.error(`Failed to initialize ChatBot for tab ${tabId}:`, error);
    }

    chrome.runtime.sendMessage({ action: "initChatWindow" }, (response) => {
        if (chrome.runtime.lastError) {
            console.warn("Popup is not open:", chrome.runtime.lastError.message);
        }
    });
    chrome.runtime.sendMessage({ action: "activateButtons" }, (response) => {
        if (chrome.runtime.lastError) {
            console.warn("Popup is not open:", chrome.runtime.lastError.message);
        }
    });
}

/**
 * Retrieves and updates the current statuses of the chatbot and summarizing process.
 * 
 * @param {number} tabId - The ID of the tab.
 * @param {string} url - The normalized URL of the current page.
 * @returns {Object} - The current statuses of the chatbot and summarization process.
 */
async function getCurrentStatuses(tabId, url) {
    if (!extensionState.hasStatus(tabId) || extensionState.getStatus(tabId).pageUrl !== url) {
        extensionState.setStatus(tabId, new StatusStateMachine(url));
    }

    const chatModel = extensionState.getChatModel(tabId);
    const statusMachine = extensionState.getStatus(tabId);
    return {
        initialized: chatModel?.isInitialized() ? "yes" : "no",
        summarized: statusMachine?.isSummarized() ? "yes" : "no",
        notRunning: statusMachine?.allNotRunning() && 
            !chatModel?.isInitializing() &&
            !chatModel?.isResponding() ? "yes" : "no"
    };
}

/**
 * Summarizes page content with an optional focus and updates the sidebar.
 * 
 * @param {number} tabId - The ID of the tab.
 * @param {string} focusInput - Optional focus for the summary.
 * @param {string} pageContent - The content of the current page.
 * @returns {string} - The generated summary.
 */
async function summarizeContent(tabId, focusInput, pageContent) {
    const statusMachine = extensionState.getStatus(tabId);
    statusMachine.stateChange("summarizing", true);

    const updateSummaryContent = (content) => chrome.tabs.sendMessage(tabId, { action: "sendSummaryUpdate", summaryContent: content });
    const onSummaryErrorUpdate = (errorMessage) => updateSummaryContent(errorMessage);

    const summary = await generateSummary(pageContent, focusInput, onSummaryErrorUpdate);
    statusMachine.stateChange("summarizing", false);
    if (!statusMachine.isSummarized()) statusMachine.setSummarized();

    return summary;
}

/**
 * Retrieves the output from the ChatBot instance for a given input.
 * 
 * @param {string} input - The user input.
 * @param {number} tabId - The ID of the tab.
 * @returns {string} - The formatted output from the ChatBot.
 */
async function getChatBotOutput(input, tabId) {
    const chatbot = extensionState.getChatModel(tabId);
    if (!chatbot) throw new Error(`ChatBot not initialized for tab ${tabId}`);
    const output = await chatbot.getChatBotOutput(input);
    return formatTextResponse(output);
}

/**
 * Analyzes a selected portion of content
 * @param {number} tabId - The ID of the tab.
 * @param {string} pageData - Content to be analyzed.
 * @param {string} summary - summary being passed in
 * @returns {string} - The generated analysis.
 */
async function analyzeContent(tabId, pageData, summary) {
    const statusMachine = extensionState.getStatus(tabId);
    statusMachine.stateChange("analyzing", true);

    const updateAnalysisContent = (content) => chrome.tabs.sendMessage(tabId, { action: "sendAnalysisUpdate", analysisContent: content });
    const onAnalysisErrorUpdate = (errorMessage) => updateAnalysisContent(errorMessage);

    const analysis = await generateAnalysis(pageData, summary, onAnalysisErrorUpdate);
    statusMachine.stateChange("analyzing", false);

    return formatTextResponse(analysis);
}

/**
 * Fact Checks a selected portion of content
 * @param {number} tabId - The ID of the tab.
 * @param {string} pageData - Content to be fact checked.
 * @param {string} summary - summary being passed in
 * @returns {string} - The generated fact check.
 */
async function factCheckContent(tabId, pageData, summary) {
    const statusMachine = extensionState.getStatus(tabId);
    statusMachine.stateChange("factChecking", true);

    const updateFactCheckContent = (content) => chrome.tabs.sendMessage(tabId, { action: "sendGeneratedFactCheck", factCheck: content });
    const onFactCheckErrorUpdate = (errorMessage) => updateFactCheckContent(errorMessage);

    const factCheck = await generateFactCheck(pageData, summary, onFactCheckErrorUpdate);
    statusMachine.stateChange("factChecking", false);

    return formatTextResponse(factCheck);
}

/**
 * Defines a selected portion of content
 * @param {number} tabId - The ID of the tab.
 * @param {string} pageData - Content to be defined.
 * @param {string} summary - summary being passed in
 * @returns {string} - The generated definition.
 */
async function defineContent(tabId, pageData, summary) {
    const statusMachine = extensionState.getStatus(tabId);
    statusMachine.stateChange("defining", true);

    const updateDefineContent = (content) => chrome.tabs.sendMessage(tabId, { action: "sendGeneratedDefinition", define: content });
    const onDefineErrorUpdate = (errorMessage) => updateDefineContent(errorMessage);

    const definition = await generateDefinition(pageData, summary, onDefineErrorUpdate);
    statusMachine.stateChange("defining", false);

    return formatTextResponse(definition);
}

/**
 * Injects required styles into the specified tab.
 * 
 * @param {number} tabId - The ID of the active tab.
 */
async function injectScriptsAndStyles(tabId) {
    try {
        await chrome.scripting.insertCSS({ target: { tabId }, files: ["./src/content/bubbles/bubbles.css", "./src/content/sidebar/sidebar.css"] });
    } catch (error) {
        console.error("Error injecting styles:", error);
    }
}