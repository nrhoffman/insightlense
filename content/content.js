import ChatBot from './utilities/chatBot';
import { createSidebar, getOrCreateLoadingSpinner } from './sidebar/sidebar.js';
import { define } from './tools/define.js';
import { factCheck } from './tools/factCheck.js';
import { generateAnalysis } from './tools/analyze.js';
import { generateSummary } from './tools/summarize.js';
import { generateRewrite } from './tools/rewrite.js';
import { getPageContent, extractContentElements, filterContentElements } from './utilities/getPageContent.js';
import { populateBubble } from './bubbles/bubbles.js';
import StatusStateMachine from './utilities/statusStateMachine';

console.log("Content script loaded");

const statusState = new StatusStateMachine();
const chatBot = new ChatBot();

// Listener for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "initializeModel":
            initializeChatBot();
            break;
        case "showSidebar":
            createSidebar();
            break;
        case 'summarizeContent':
            if (!statusState.isRunning("summarizing")) summarizeContent(request.focusInput);
            break;
        case 'rewriteContent':
            if (!statusState.isRunning("rewriting")) rewriteContent(request.readingLevel);
            break;
        case 'getChatBotOutput':
            getChatBotOutput(request.chatInput);
            break;
        case 'displayDefineBubble':
            displayBubble(request.selectedText, 'defineBubble');
            break;
        case 'displayFactCheckBubble':
            displayBubble(request.selectedText, 'factCheckBubble');
            break;
        case 'displayAnalysisBubble':
            displayBubble(request.selectedText, 'analysisBubble');
            break;
        case 'getStatuses':
            sendResponse(getCurrentStatuses());
            break;
    }
});

// Event listeners for updating character count
document.addEventListener("mouseup", updateCharacterCount);
document.addEventListener("keyup", updateCharacterCount);

// Listen for page unload event to clean up the model
window.addEventListener('beforeunload', cleanup);

/**
 * Initializes the chatbot model by extracting and processing the page content.
 * Activates relevant buttons in the sidebar upon successful initialization.
 */
async function initializeChatBot() {
    if (!chatBot.isInitialized() && !chatBot.isInitializing()) {
        const pageContent = await getPageContent();
        await chatBot.initializeModel(pageContent);
        chrome.runtime.sendMessage({ action: "activateSendButton" });
        chrome.runtime.sendMessage({ action: "activateSummaryButton" });
    }
}

/**
 * Retrieves and processes output from the chatbot model based on user input.
 * Displays the model's response in the sidebar.
 * @param {string} input - The user input to send to the chatbot.
 */
async function getChatBotOutput(input) {
    let result = await chatBot.getChatBotOutput(input);
    chrome.runtime.sendMessage({ action: "setChatBotOutput", output: formatTextResponse(result) });
}

/**
 * Generates a summary of the page content and displays it in the sidebar.
 * Optionally focuses the summary on a specific topic if provided.
 * @param {string} focusInput - Optional focus for the summary.
 */
async function summarizeContent(focusInput) {
    statusState.stateChange("summarizing", true);

    const summary = document.getElementById('summary');
    summary.innerHTML = '';
    const loadingSpinner = getOrCreateLoadingSpinner(summary);

    const updateSummaryContent = (content) => {
        summary.innerHTML = `<span>${content.replace(/[\*-]/g, '')}</span>`;
    };

    const onSummaryErrorUpdate = (errorMessage) => updateSummaryContent(errorMessage);

    const pageContent = await getPageContent();
    const combinedSummary = await generateSummary(pageContent, focusInput, onSummaryErrorUpdate);

    updateSummaryContent(combinedSummary);

    statusState.stateChange("summarizing", false);
    if (!statusState.isSummarized()) statusState.setSummarized();

    loadingSpinner.remove();
    chrome.runtime.sendMessage({ action: "activateSummaryButton" });
    chrome.runtime.sendMessage({ action: "activateRewriteButton" });
}

/**
 * Rewrites the page content to ensure readability at the desired level,
 * free from bias or logical fallacies. Updates the sidebar after processing.
 * @param {string} readingLevel - The target reading level for the rewrite.
 */
async function rewriteContent(readingLevel) {
    statusState.stateChange("rewriting", true);

    const summary = document.getElementById('summary').innerText;
    const mainElements = document.querySelectorAll('article, main, section, div');
    const mainContentElements = await extractContentElements(mainElements);
    const contentElements = await filterContentElements(mainContentElements);

    const validElements = contentElements.filter(element => {
        const text = element.textContent.trim();
        return text.length > 0 && text.split(/\s+/).length >= 5;
    });

    // await generateRewrite(validElements, summary, readingLevel); TODO: Finish when API is working

    statusState.stateChange("rewriting", false);

    chrome.runtime.sendMessage({ action: "activateSummaryButton" });
    chrome.runtime.sendMessage({ action: "activateRewriteButton" });
}

/**
 * Displays a draggable bubble with the result of defining, fact-checking, or analyzing selected text.
 * @param {string} selectedText - Text selected by the user.
 * @param {string} type - Type of bubble to display (define, factCheck, or analysis).
 */
async function displayBubble(selectedText, type) {
    let result = await populateBubble(type);
    if (result === "Error") return;

    const updateBubbleContent = (content, title) => {
        const bubble = document.getElementById(type);
        bubble.innerHTML = `
            <div class="bubble-title">${title}</div>
            <div class="bubble-content">${formatTextResponse(content)}</div>
            <footer class="bubble-footer">
                <small>Click And Hold To Drag The Window<br>Double Click Bubble To Close The Window</small>
            </footer>
        `;
    };

    const onErrorUpdate = (errorMessage) => updateBubbleContent(errorMessage, type.charAt(0).toUpperCase() + type.slice(1));

    if (type === "factCheckBubble") {
        result = await factCheck(selectedText, onErrorUpdate);
        updateBubbleContent(result, "Fact Check");
    } else if (type === "defineBubble") {
        result = await define(selectedText, onErrorUpdate);
        updateBubbleContent(result, "Define");
    } else if (type === "analysisBubble") {
        const analyzeButton = document.getElementById('analyzeButton');
        if (!analyzeButton._listenerAdded) {
            analyzeButton.addEventListener('click', async () => {
                const filteredText = selectedText.split('\n')
                    .filter(line => (line.match(/ /g) || []).length >= 8)
                    .join('\n');

                if (filteredText.length === 0 || filteredText.length > 4000) {
                    displayErrorMessage(filteredText.length === 0 ? "Error: Text must be highlighted." : "Error: Selected characters must be under 4000.");
                    return;
                }

                analyzeButton.remove();
                document.getElementById("bubbleText").innerText = "Analysis will go to sidebar.";
                await new Promise(r => setTimeout(r, 3000));
                analyzeContent(filteredText);
            });
            analyzeButton._listenerAdded = true;
        }
    }
}

/**
 * Analyzes a selected portion of content and displays the result in the sidebar.
 * Updates the sidebar with the analysis or an error message.
 * @param {string} pageData - Content to be analyzed.
 */
async function analyzeContent(pageData) {
    statusState.stateChange("analyzing", true);

    const analysisText = document.getElementById('analysis');
    analysisText.innerHTML = '';
    const loadingSpinner = getOrCreateLoadingSpinner(analysisText);

    const updateAnalysisContent = (content) => {
        analysisText.innerHTML = `<span>${formatTextResponse(content)}</span>`;
    };

    const onAnalysisErrorUpdate = (errorMessage) => updateAnalysisContent(errorMessage);

    const analysis = await generateAnalysis(pageData, onAnalysisErrorUpdate);
    updateAnalysisContent(analysis);

    statusState.stateChange("analyzing", false);
    loadingSpinner.remove();
}

/**
 * Updates the character count in the sidebar based on the current text selection.
 */
function updateCharacterCount() {
    const currentElementClass = document.getElementById("currentCharCount");
    if (currentElementClass) {
        const selectedText = window.getSelection().toString();
        const filteredText = selectedText.split('\n')
            .filter(line => (line.match(/ /g) || []).length >= 8)
            .join('\n');
        let characterCount = 0;

        try { characterCount = filteredText.length; }
        catch (error) { return; }

        if (characterCount > 0) {
            currentElementClass.innerText = `Current Characters Selected: ${characterCount}`;
            currentElementClass.style.color = characterCount > 4000 ? 'red' : 'white';
        }
    }
}

/**
 * Cleans up the model when the page is unloaded.
 */
function cleanup() {
    chatBot.destroyModel();
    document.removeEventListener("mouseup", updateCharacterCount);
    document.removeEventListener("keyup", updateCharacterCount);
}

/**
 * Returns the current statuses of the chatbot and the summarizing process.
 * @returns {Object} - The current statuses of the chatbot and summarizing state.
 */
function getCurrentStatuses() {
    return {
        initialized: chatBot.isInitialized() ? "yes" : "no",
        summarized: statusState.isSummarized() ? "yes" : "no",
        notRunning: (statusState.allNotRunning() && !chatBot.isInitializing()) ? "yes" : "no"
    };
}

/**
 * Displays an error message in the analysis bubble if the text selection does not meet requirements.
 * @param {string} message - The error message to display.
 */
function displayErrorMessage(message) {
    const analyzeBubble = document.getElementById('analysisBubble');
    const analyzeBoxContainer = analyzeBubble.querySelector('.bubble-content');
    
    let errorMessage = document.querySelector('.error-message');
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.style.color = 'red';
        errorMessage.style.marginBottom = '10px';
        errorMessage.style.marginTop = '10px';
        errorMessage.style.textAlign = 'center';
        errorMessage.style.fontSize = '1em';
        errorMessage.style.fontWeight = '500';
        analyzeBoxContainer.insertBefore(errorMessage, document.getElementById('analyzeButton'));
    }
    errorMessage.innerText = message;
}

/**
 * Formats the text response from the model, adding HTML tags for emphasis, bullets, etc.
 * @param {string} response - The raw response text from the model.
 * @returns {string} - The formatted HTML string.
 */
function formatTextResponse(response) {
    let htmlData = response.replace(/## (.*?)(?=\n|$)/g, "");
    htmlData = htmlData.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    htmlData = htmlData.replace(/^\s*\*\s+/gm, "• ");
    htmlData = htmlData.replace(/\*(.*?)\*/g, "<em>$1</em>");
    htmlData = htmlData.replace(/\n/g, "<br>");
    return htmlData;
}