import { analyzeButtonHandler, rewriteButtonHandler } from './utility/buttonHandlers.js';
import { createSidebar, getOrCreateLoadingSpinner } from './sidebar/sidebar.js';
import { formatTextResponse } from '../utilities/formatTextResponse.js';
import { generateRewrite } from '../tools/rewrite.js';
import { getPageContent } from '../utilities/getPageContent.js';
import { populateBubble } from './bubbles/bubbles.js';

console.log("Content script loaded");

// DOM event handler
document.addEventListener('DOMContentLoaded', async () => {
    await new Promise(r => setTimeout(r, 3000));
    chrome.runtime.sendMessage({ action: "initExtension" });
});

// Click event handler
const dynamicClickHandler = async (event) => {
    const { target } = event;
    if (target) {
        if (target.id === 'analyzeButton') {
            await analyzeButtonHandler(analyzeContent);
        }
        else if (target.id === 'rewriteButton') {
            await rewriteButtonHandler(rewriteContent);
        }
    }
};

// Change event handler
const dynamicChangeHandler = async (event) => {
    const { target } = event;

    // Ensure the event target is a checkbox with name="readingLevel"
    if (target && target.name === 'readingLevel' && target.closest('#reading-level')) {
        // Get all checkboxes with name="readingLevel"
        const checkboxes = document.querySelectorAll('input[name="readingLevel"]');

        // Loop through the checkboxes and uncheck all except the clicked one
        checkboxes.forEach(checkbox => {
            if (checkbox !== target) {
                checkbox.checked = false;
            }
        });
    }
};

// Add event listener for dynamically created buttons
document.addEventListener('click', dynamicClickHandler);

// Add event listener for dynamically created buttons
document.addEventListener('change', dynamicChangeHandler);

// Listener for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "showSidebar":
            createSidebar();
            loadStoredContent();
            break;
        case "sendInitMsg":
            sendInitMsg();
            break;
        case "startingSummary":
            summarizeContent(request.tabId);
            break;
        case "sendSummaryUpdate":
            const summaryEl = document.getElementById('summary');
            summaryEl.innerHTML = `<span>${(request.summarizeContent).replace(/[\*-]/g, '')}</span>`;
            break;
        case "sendAnalysisUpdate":
            const analysisEl = document.getElementById('analysis');
            analysisEl.innerHTML = `<span>${(request.analyzedContent).replace(/[\*-]/g, '')}</span>`;
            break;
        case "sendGeneratedSummary":
            updateGeneratedSummary(request.summary);
            break;
        case "sendGeneratedAnalysis":
            updateGeneratedAnalysis(request.analysis);
            break;
        case "sendGeneratedFactCheck":
            updateGeneratedFcOrDefine('factCheckBubble', request.factCheck)
            break;
        case "sendGeneratedDefinition":
            updateGeneratedFcOrDefine('defineBubble', request.define)
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
        case 'displayRewriteBubble':
            displayBubble(request.selectedText, 'rewriteBubble');
            break;
    }
});

// Event listeners for updating character count
document.addEventListener("mouseup", updateCharacterCount);
document.addEventListener("keyup", updateCharacterCount);

// Listen for page unload event to clean up the model
window.addEventListener('pagehide', () => {
    cleanup();
});

/**
 * Initializes the chatbot model by extracting and processing the page content.
 * Activates relevant buttons in the sidebar upon successful initialization.
 */
async function sendInitMsg() {
    const pageContent = await getPageContent();
    chrome.runtime.sendMessage({ action: "initChatBot", pageContent: pageContent });
}

/**
 * Generates a summary of the page content and displays it in the sidebar.
 * Optionally focuses the summary on a specific topic if provided.
 * @param {string} tabId - The ID of the current tab.
 */
async function summarizeContent(tabId) {
    const summaryEl = document.getElementById('summary');
    summaryEl.innerHTML = '';
    const loadingSpinner = getOrCreateLoadingSpinner(summaryEl);

    const pageContent = await getPageContent();

    chrome.runtime.sendMessage({ action: "summarizeContent", tabId: tabId, pageContent: pageContent });
}

/**
 * Updates the summary section in the sidebar with the newly generated summary.
 * @param {string} summary - The summary text to display in the sidebar.
 */
async function updateGeneratedSummary(summary) {
    const summaryEl = document.getElementById('summary');
    const loadingSpinner = getOrCreateLoadingSpinner(summaryEl);
    summaryEl.innerHTML = `<span>${(summary).replace(/[\*-]/g, '')}</span>`;
    loadingSpinner.remove();

    await saveContentToStorage("summary", summary);
}

/**
 * Displays a draggable bubble with the result of defining, fact-checking, or analyzing selected text.
 * @param {string} selectedText - Text selected by the user.
 * @param {string} type - Type of bubble to display (define, factCheck, or analysis).
 */
async function displayBubble(selectedText, type) {
    const summaryEl = document.getElementById('summary');
    const summary = summaryEl.innerText;
    let result = await populateBubble(type);
    if (result === "Error") return;

    if (type === "factCheckBubble") {
        chrome.runtime.sendMessage({ action: "factCheckContent", pageContent: selectedText, summary: summary });
    } else if (type === "defineBubble") {
        chrome.runtime.sendMessage({ action: "defineContent", pageContent: selectedText, summary: summary });
    } else if (type === "analysisBubble") {
        updateCharacterCount();
    } else if (type === "rewriteBubble") {
        updateCharacterCount();
    }
}

/**
 * Analyzes a selected portion of content and displays the result in the sidebar.
 * Updates the sidebar with the analysis or an error message.
 * @param {string} pageData - Content to be analyzed.
 */
async function analyzeContent(pageData) {
    const analysisEl = document.getElementById('analysis');
    const summaryEl = document.getElementById('summary');
    const summary = summaryEl.innerText;
    analysisEl.innerHTML = '';

    const loadingSpinner = getOrCreateLoadingSpinner(analysisEl);

    chrome.runtime.sendMessage({ action: "analyzeContent", pageContent: pageData, summary: summary });
}

/**
 * Updates the analysis section in the sidebar with the newly generated analysis.
 * @param {string} analysis - The analysistext to display in the sidebar.
 */
async function updateGeneratedAnalysis(analysis) {
    const analysisEl = document.getElementById('analysis');
    const loadingSpinner = getOrCreateLoadingSpinner(analysisEl);
    analysisEl.innerHTML = analysis;
    loadingSpinner.remove();

    await saveContentToStorage("analysis", analysis);
}

/**
 * Updates the fact check and define bubbles with the newly generated fact check or definition.
 * @param {string} type - fact check or definition
 * @param {string} content - content to fill in bubble
 */
async function updateGeneratedFcOrDefine(type, content){
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
    if (type === "factCheckBubble") {
        updateBubbleContent(content, "Fact Check");
    }
    else if (type === "defineBubble") {
        updateBubbleContent(content, "Define");
    }
}

/**
 * Rewrites a selected portion of content and prints it in-place in the element
 * Uses selected reading level and removes bias, logical fallacy, and propaganda.
 * @param {string} selectedReadingLevel - the reading level desired
 */
async function rewriteContent(selectedReadingLevel) {
    chrome.runtime.sendMessage({ action: "startRewriting" });
    const rewriteBubbleText = document.querySelector('.rewriteBubble #bubbleText');

    const updateRewriteBubble = (content) => {
        rewriteBubbleText.innerHTML = `<span>${formatTextResponse(content)}</span>`;
    };

    const onRewriteErrorUpdate = (errorMessage) => updateRewriteBubble(errorMessage);

    const result = await generateRewrite(selectedReadingLevel, onRewriteErrorUpdate);
    updateRewriteBubble(result);

    chrome.runtime.sendMessage({ action: "stopRewriting" });
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
 * Saves content to Chrome's local storage along with the current timestamp.
 * This helps to track when each entry was saved for expiration purposes.
 * 
 * @param {string} type - The type of content to save (e.g., "summary" or "analysis").
 * @param {string} content - The content to save in local storage.
 */
async function saveContentToStorage(type, content) {
    const url = window.location.href;
    const key = `${url}_${type}`;

    // Create a structured data object for the content and timestamp
    const data = {
        [key]: {
            content: content,
            timestamp: Date.now()
        }
    };

    // Save the structured object to local storage
    await chrome.storage.local.set(data);
}

/**
 * Retrieves content from Chrome's local storage and checks if it is expired.
 * Returns the content only if it is less than 24 hours old.
 * 
 * @param {string} type - The type of content to retrieve (e.g., "summary" or "analysis").
 * @returns {string|null} - Returns the saved content if it exists and is recent; otherwise, returns null.
 */
async function getContentFromStorage(type) {
    const url = window.location.href;
    const key = `${url}_${type}`;
    const data = await chrome.storage.local.get(key);

    // Check if the data exists and if the timestamp is within the last 24 hours
    if (data[key]) {
        const { content, timestamp } = data[key];
        const currentTime = Date.now();
        const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // If the timestamp is less than 24 hours old, return the content
        if (currentTime - timestamp <= ONE_DAY_MS) {
            return content;
        }
    }

    // Return null if content is expired or not available
    return null;
}

/**
 * Loads stored summary and analysis content for the current page from Chrome's local storage.
 * If content is found, it updates the corresponding HTML elements in the sidebar to display the stored data.
 */
async function loadStoredContent() {
    const storedSummary = await getContentFromStorage("summary");
    const storedAnalysis = await getContentFromStorage("analysis");

    if (storedSummary) {
        summary.innerHTML = `<span>${storedSummary.replace(/[\*-]/g, '')}</span>`;
    }
    if (storedAnalysis) {
        analysis.innerHTML = `<span>${formatTextResponse(storedAnalysis)}</span>`;
    }
}

/**
 * Cleans up the model when the page is unloaded.
 */
function cleanup() {
    document.removeEventListener("mouseup", updateCharacterCount);
    document.removeEventListener("keyup", updateCharacterCount);
    document.removeEventListener('click', dynamicClickHandler);
    document.removeEventListener('change', dynamicChangeHandler);
}