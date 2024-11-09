import { createSidebar, getOrCreateLoadingSpinner } from './sidebar/sidebar.js';
import { define } from './utilities/define.js';
import { factCheck } from './utilities/faceCheck.js';
import { generateAnalysis } from './utilities/analyze.js';
import { generateSummary } from './utilities/summarize.js';
import { getPageContent } from './utilities/getPageContent.js';
import { initializeModel } from './utilities/initializeModel.js';
import { populateBubble, bubbleDragging } from './bubbles/bubbles.js';

console.log("Content script loaded");
let modelInstance = null;
let modelReady = false;
let summarizationReady = true;
let analysisReady = true;
let initializationReady = false;

// Listener for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "initializeModel":
            initModel();
        case "showSidebar":
            createSidebar();
            break;
        case 'summarizeContent':
            summarizeContent(request.focusInput);
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
                modelStatus: modelReady ? "yes" : "no",
                summarizationStatus: summarizationReady ? "yes" : "no",
                analysisStatus: analysisReady ? "yes" : "no",
                initializationStatus: initializationReady ? "yes" : "no",
                summaryGenStatus: checkSummary() ? "yes" : "no"
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
    initializationReady = true;

    // Request page content
    const pageContent = await getPageContent();

    // Initialize Chat Bot model
    modelInstance = await initializeModel(modelInstance, pageContent);
    chrome.runtime.sendMessage({ action: "activateSendButton" });
    chrome.runtime.sendMessage({ action: "activateSummaryButton" });
    modelReady = true;
}

/**
 * Generates a summary for the current page content and updates the sidebar.
 * @param {string} focusInput - Optional input to focus the summary on a specific topic.
 */
async function summarizeContent(focusInput) {
    summarizationReady = false;
    const summary = document.getElementById('summary');
    summary.innerHTML = '';
    const loadingSpinner = getOrCreateLoadingSpinner(summary);

    // Request page content
    const pageContent = await getPageContent();

    // Generate Summary
    const combinedSummary = await generateSummary(pageContent, focusInput);

    loadingSpinner.remove();
    summary.innerHTML = `<span>${combinedSummary.replace(/\*/g, '')}</span>`;
    chrome.runtime.sendMessage({ action: "activateSummaryButton" });
    summarizationReady = true;
}

/**
 * Analyzes a portion of page content and displays the result in the sidebar.
 * @param {string} pageData - Content data for analysis.
 */
async function analyzeContent(pageData) {
    analysisReady = false;
    const analysisText = document.getElementById('analysis');
    analysisText.innerHTML = '';
    const loadingSpinner = getOrCreateLoadingSpinner(analysisText);

    // Analyze selected content
    const analysisContent = document.getElementById('analysis');
    const analysis = await generateAnalysis(pageData);
    analysisContent.innerHTML = `<span>${formatTextResponse(analysis)}</span>`;

    loadingSpinner.remove();
    analysisReady = true;
}

/**
 * Displays a draggable bubble with the result of defining, fact-checking, or analyzing selected text.
 * @param {string} selectedText - Text selected by the user.
 * @param {string} type - Type of bubble to display (define, factCheck, or analysis).
 */
async function displayBubble(selectedText, type) {
    let result = '';

    await populateBubble(type);

    if (type === "factCheckBubble") {
        const factCheckBubble = document.getElementById(type);
        result = await factCheck(selectedText);
        factCheckBubble.innerHTML = `
        <div class="bubble-title">Fact Checker</div>
        <div class="bubble-content">${formatTextResponse(result) || "Error fetching result."}</div>
        <footer class="bubble-footer">
            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
        </footer>
        `;
    } else if (type === "defineBubble") {
        const defineBubble = document.getElementById(type);
        result = await define(selectedText);
        defineBubble.innerHTML = `
        <div class="bubble-title">Define</div>
        <div class="bubble-content">${formatTextResponse(result) || "Error fetching result."}</div>
        <footer class="bubble-footer">
            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
        </footer>
        `;
    } else if (type === "analysisBubble") {
        const analyzeBubble = document.getElementById(type);

        if (!analyzeButton._listenerAdded) {
            // Listener removes after analysis button pressed
            document.getElementById('analyzeButton').addEventListener('click', async () => {
                const filteredText = selectedText
                    .split('\n')
                    .filter(line => (line.match(/ /g) || []).length >= 8)
                    .join('\n');

                if (filteredText.length === 0 || filteredText.length > 4000) {
                    const errorText = filteredText.length === 0
                        ? "Text must be highlighted."
                        : "Selected characters must be under 4000.";
                    displayError(errorText);
                    return;
                }
                analyzeBubble.remove();

                // Analysis Starts
                await analyzeContent(filteredText);
            }, { once: true })

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
        let characterCount = 0;

        try { characterCount = selectedText.length; }
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
    const analyzeBoxContainer = document.querySelector('bubble-content');
    let errorMessage = document.querySelector('.error-message');
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.style.color = 'red';
        errorMessage.style.marginBottom = '10px';
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
 * Checks if a summary has been generated and returns the status.
 * @returns {boolean} - True if a summary is present, false otherwise.
 */
function checkSummary() {
    const summary = document.getElementById('summary');
    return summary.innerText !== "";
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
