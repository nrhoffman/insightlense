import { createSidebar, getOrCreateLoadingSpinner } from './sidebar/sidebar.js';
import { define } from './tools/define.js';
import { factCheck } from './tools/factCheck.js';
import { generateAnalysis } from './tools/analyze.js';
import { generateSummary } from './tools/summarize.js';
import { generateRewrite } from './tools/rewrite.js';
import { getPageContent, extractContentElements, filterContentElements } from './utilities/getPageContent.js';
import { initializeModel } from './utilities/initializeModel.js';
import { populateBubble } from './bubbles/bubbles.js';
import StatusStateMachine from './utilities/statusStateMachine';

console.log("Content script loaded");
let modelInstance = null;
const statusState = new StatusStateMachine();

// Listener for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "initializeModel":
            if (!statusState.isRunning("initializing") && !statusState.isInitialized()){
                initModel();
            }
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
                initialized: statusState.isInitialized() ? "yes" : "no",
                summarized: statusState.isSummarized() ? "yes" : "no",
                notRunning: statusState.allNotRunning() ? "yes" : "no" 
            });
            break;
    }
});

// Event listeners for updating the character count
document.addEventListener("mouseup", updateCharacterCount);
document.addEventListener("keyup", updateCharacterCount);

// Listen for the page unload event to cleanup the model
window.addEventListener('beforeunload', () => {
    if (modelInstance) {
        modelInstance.destroy();
        console.log("Chat Bot Model Destroyed");
    }
    document.removeEventListener("mouseup", updateCharacterCount);
    document.removeEventListener("keyup", updateCharacterCount);
});

/**
 * Initializes the chatbot model and sends activation messages for sidebar buttons.
 */
async function initModel() {
    statusState.stateChange("initializing", true);
    // Request page content
    const pageContent = await getPageContent();

    // Initialize Chat Bot model
    modelInstance = await initializeModel(modelInstance, pageContent);

    statusState.stateChange("initializing", false);
    statusState.setInitialized();
    chrome.runtime.sendMessage({ action: "activateSendButton" });
    chrome.runtime.sendMessage({ action: "activateSummaryButton" });
}

/**
 * Generates a summary for the current page content and updates the sidebar.
 * @param {string} focusInput - Optional input to focus the summary on a specific topic.
 */
async function summarizeContent(focusInput) {
    statusState.stateChange("summarizing", true);
    
    const summary = document.getElementById('summary');
    summary.innerHTML = '';
    const loadingSpinner = getOrCreateLoadingSpinner(summary);

    // Function to update the summary content
    const updateSummaryContent = (content) => {
        summary.innerHTML = `<span>${content.replace(/[\*-]/g, '')}</span>`;
    };

    // Define the error callback to use the update function
    const onSummaryErrorUpdate = (errorMessage) => {
        updateSummaryContent(errorMessage);
    };

    // Request page content
    const pageContent = await getPageContent();

    // Generate Summary
    const combinedSummary = await generateSummary(pageContent, focusInput, onSummaryErrorUpdate);

    updateSummaryContent(combinedSummary);

    statusState.stateChange("summarizing", false);

    // Set to summarized for first summarization
    if (!statusState.isSummarized()) statusState.setSummarized();

    loadingSpinner.remove();
    chrome.runtime.sendMessage({ action: "activateSummaryButton" });
    chrome.runtime.sendMessage({ action: "activateRewriteButton" });
}

/**
 * Rewrites the contents on the webpage to have no bias or logical falacies at the desired reading level
 * @param {string} readingLevel - Desired reading level for the rewrite
 */
async function rewriteContent(readingLevel) {
    statusState.stateChange("rewriting", true);
    
    const summary = document.getElementById('summary').innerText;

    // Fetch content elements
    const mainElements = document.querySelectorAll('article, main, section, div');
    const mainContentElements = await extractContentElements(mainElements);
    const contentElements = await filterContentElements(mainContentElements);

    // Filter elements based on content length and word count
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
 * Analyzes a portion of page content and displays the result in the sidebar.
 * @param {string} pageData - Content data for analysis.
 */
async function analyzeContent(pageData) {
    statusState.stateChange("analyzing", true);

    const analysisText = document.getElementById('analysis');
    analysisText.innerHTML = '';
    const loadingSpinner = getOrCreateLoadingSpinner(analysisText);

    // Function to update the bubble content
    const updateAnalysisContent = (content) => {
        analysisText.innerHTML = `<span>${formatTextResponse(content)}</span>`;
    };

    // Define the error callback to use the update function
    const onAnalysisErrorUpdate = (errorMessage) => {
        updateAnalysisContent(errorMessage);
    };

    // Analyze selected content
    const analysis = await generateAnalysis(pageData, onAnalysisErrorUpdate);

    // Final update with the result or final failure message
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

        // Function to update the bubble content
        const updateFactCheckBubbleContent = (content) => {
            factCheckBubble.innerHTML = `
                <div class="bubble-title">Fact Check</div>
                <div class="bubble-content">${formatTextResponse(content)}</div>
                <footer class="bubble-footer">
                    <small>Click And Hold To Drag The Window<br>Double Click Bubble To Close The Window</small>
                </footer>
            `;
        };

        // Define the error callback to use the update function
        const onFactCheckErrorUpdate = (errorMessage) => {
            updateFactCheckBubbleContent(errorMessage);
        };

        result = await factCheck(selectedText, onFactCheckErrorUpdate);

        // Final update with the result or final failure message
        updateFactCheckBubbleContent(result);
    } 
    else if (type === "defineBubble") {
        const defineBubble = document.getElementById(type);

        // Function to update the bubble content
        const updateDefineBubbleContent = (content) => {
            defineBubble.innerHTML = `
                <div class="bubble-title">Define</div>
                <div class="bubble-content">${formatTextResponse(content)}</div>
                <footer class="bubble-footer">
                    <small>Click And Hold To Drag The Window<br>Double Click Bubble To Close The Window</small>
                </footer>
            `;
        };

        // Define the error callback to use the update function
        const onDefineErrorUpdate = (errorMessage) => {
            updateDefineBubbleContent(errorMessage);
        };

        result = await define(selectedText, onDefineErrorUpdate);

        // Final update with the result or final failure message
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

                // Analysis Starts
                await analyzeContent(filteredText);
            });

            analyzeButton._listenerAdded = true;
        }
    }
}

/**
 * Updates character count in the sidebar based on the text currently selected by the user.
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
 * Displays an error message if conditions are not met when analyze button is pressed.
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
 * Formats model response by applying HTML tags for emphasis, bold, bullets, and line breaks.
 * @param {string} response - Text response from model.
 * @returns {string} - Formatted HTML string.
 */
function formatTextResponse(response) {
    let htmlData = response.replace(/## (.*?)(?=\n|$)/g, "");
    htmlData = htmlData.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    htmlData = htmlData.replace(/^\s*\*\s+/gm, "• ");
    htmlData = htmlData.replace(/\*(.*?)\*/g, "<em>$1</em>");
    htmlData = htmlData.replace(/\n/g, "<br>");
    return htmlData;
}

/**
 * Retrieves output from chatbot model with retry logic if the request fails.
 * @param {string} input - User input to send to the chatbot.
 * @param {number} retries - Maximum number of retry attempts.
 * @param {number} delay - Delay between retry attempts in milliseconds.
 */
async function getChatBotOutput(input, retries = 10, delay = 1000) {
    let result = '';
    let attempt = 0;

    if (modelInstance) {
        while (attempt < retries) {
            try {
                result = await modelInstance.prompt(input);
                chrome.runtime.sendMessage({ action: "setChatBotOutput", output: formatTextResponse(result) });
                break;
            } catch (error) {
                console.log(`Error initializing content on attempt ${attempt + 1}:`, error);
                attempt++;
                if (attempt < retries) {
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                } else {
                    console.log("Max retries reached. Returning empty result.");
                }
            }
        }
    }
}
