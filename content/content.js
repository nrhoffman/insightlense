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
            if (!chatBot.isInitialized() && !chatBot.isInitializing()){
                initModel();
            }
            break;
        case "showSidebar":
            createSidebar();
            break;
        case 'summarizeContent':
            if (!statusState.isRunning("summarizing")){
                summarizeContent(request.focusInput);
            }
            break;
        case 'rewriteContent':
            if (!statusState.isRunning("rewriting")){
                rewriteContent(request.readingLevel);
            }
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
            sendResponse({
                initialized: chatBot.isInitialized() ? "yes" : "no",
                summarized: statusState.isSummarized() ? "yes" : "no",
                notRunning: (statusState.allNotRunning() && !chatBot.isInitializing()) ? "yes" : "no" 
            });
            break;
    }
});

// Event listeners for updating the character count
document.addEventListener("mouseup", updateCharacterCount);
document.addEventListener("keyup", updateCharacterCount);

// Listen for the page unload event to cleanup the model
window.addEventListener('beforeunload', () => {
    chatBot.destroyModel();

    document.removeEventListener("mouseup", updateCharacterCount);
    document.removeEventListener("keyup", updateCharacterCount);
});

/**
 * Initializes the chatbot model by extracting and processing the page content.
 * Activates relevant buttons in the sidebar upon successful initialization.
 */
async function initModel() {
    const pageContent = await getPageContent();
    await chatBot.initializeModel(pageContent);

    chrome.runtime.sendMessage({ action: "activateSendButton" });
    chrome.runtime.sendMessage({ action: "activateSummaryButton" });
}

/**
 * Retrieves and processes output from the chatbot model based on user input.
 * Displays the model's response in the sidebar.
 * @param {string} input - The user input to send to the chatbot.
 */
async function getChatBotOutput(input){
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

    const onSummaryErrorUpdate = (errorMessage) => {
        updateSummaryContent(errorMessage);
    };

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

    // await generateRewrite(validElements, summary, readingLevel); TODO: Finish when api is working

    statusState.stateChange("rewriting", false);

    chrome.runtime.sendMessage({ action: "activateSummaryButton" });
    chrome.runtime.sendMessage({ action: "activateRewriteButton" });
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

    const onAnalysisErrorUpdate = (errorMessage) => {
        updateAnalysisContent(errorMessage);
    };

    const analysis = await generateAnalysis(pageData, onAnalysisErrorUpdate);
    updateAnalysisContent(analysis);

    statusState.stateChange("analyzing", false);
    loadingSpinner.remove();
}

/**
 * Displays a draggable bubble with the result of defining, fact-checking, or analyzing selected text.
 * @param {string} selectedText - Text selected by the user.
 * @param {string} type - Type of bubble to display (define, factCheck, or analysis).
 */
async function displayBubble(selectedText, type) {
    let result = '';

    result = await populateBubble(type);
    if (result === "Error") return;

    if (type === "factCheckBubble") {
        const factCheckBubble = document.getElementById(type);

        const updateFactCheckBubbleContent = (content) => {
            factCheckBubble.innerHTML = `
                <div class="bubble-title">Fact Check</div>
                <div class="bubble-content">${formatTextResponse(content)}</div>
                <footer class="bubble-footer">
                    <small>Click And Hold To Drag The Window<br>Double Click Bubble To Close The Window</small>
                </footer>
            `;
        };

        const onFactCheckErrorUpdate = (errorMessage) => {
            updateFactCheckBubbleContent(errorMessage);
        };

        result = await factCheck(selectedText, onFactCheckErrorUpdate);
        updateFactCheckBubbleContent(result);
    } 
    else if (type === "defineBubble") {
        const defineBubble = document.getElementById(type);

        const updateDefineBubbleContent = (content) => {
            defineBubble.innerHTML = `
                <div class="bubble-title">Define</div>
                <div class="bubble-content">${formatTextResponse(content)}</div>
                <footer class="bubble-footer">
                    <small>Click And Hold To Drag The Window<br>Double Click Bubble To Close The Window</small>
                </footer>
            `;
        };

        const onDefineErrorUpdate = (errorMessage) => {
            updateDefineBubbleContent(errorMessage);
        };

        result = await define(selectedText, onDefineErrorUpdate);
        updateDefineBubbleContent(result);
    } 
    else if (type === "analysisBubble") {
        const analyzeBubble = document.getElementById(type);
        const analyzeButton = document.getElementById('analyzeButton');

        if (!analyzeButton._listenerAdded) {
            document.getElementById('analyzeButton').addEventListener('click', async () => {
                const filteredText = selectedText
                    .split('\n')
                    .filter(line => (line.match(/ /g) || []).length >= 8)
                    .join('\n');

                if (filteredText.length === 0 || filteredText.length > 4000) {
                    const errorText = filteredText.length === 0
                        ? "Error: Text must be highlighted."
                        : "Error: Selected characters must be under 4000.";
                    displayError(errorText);
                    analyzeButton.remove();
                    document.getElementById("currentCharCount").remove();
                    document.getElementById("bubbleText").remove();
                    return;
                }
                analyzeButton.remove();
                document.getElementById("currentCharCount").remove();
                document.getElementById("bubbleText").innerText = "Analysis will go to sidebar."
                await new Promise(r => setTimeout(r, 3000));
                analyzeBubble.remove();

                await analyzeContent(filteredText);
            });

            analyzeButton._listenerAdded = true;
        }
    }
}

/**
 * Updates the character count in the sidebar based on the current text selection.
 */
function updateCharacterCount() {
    const currentElementClass = document.getElementById("currentCharCount");
    if (currentElementClass) {
        const selectedText = window.getSelection().toString();
        const filteredText = selectedText
        .split('\n')
        .filter(line => (line.match(/ /g) || []).length >= 8)
        .join('\n');
        let characterCount = 0;

        try { characterCount = filteredText.length; }
        catch (error) { return; }

        if (characterCount > 0) {
            currentElementClass.innerText = `Current Characters Selected: ${characterCount}`;
            if (characterCount > 4000) {
                currentElementClass.style.color = 'red';
            } else {
                currentElementClass.style.color = 'white';
            }
        }
    }
}

/**
 * Displays an error message in the analysis bubble if the text selection does not meet requirements.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    const analyzeBubble = document.getElementById('analysisBubble');
    const analyzeBoxContainer = analyzeBubble.querySelector('.bubble-content')
    
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
        analyzeBoxContainer.insertBefore(errorMessage, analyzeButton);
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