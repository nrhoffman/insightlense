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

// Function fills the sidebar with a summary
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

// Function that populates the analysis portion of the sidebar
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

// Function that displays bubbles
async function displayBubble(selectedText, type) {
    let result = '';

    await populateBubble(type);

    if (type === "factCheckBubble") {
        const factCheckBubble = document.getElementById(type);
        result = await factCheck(selectedText);
        factCheckBubble.innerHTML = '';
        factCheckBubble.innerHTML = `
        <div class="bubble-title">Fact Checker</div>
        <div class="bubble-content">${formatTextResponse(result) || "Error fetching result."}</div>
        <footer class="bubble-footer">
            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
        </footer>
        `;
    }
    else if (type === "defineBubble") {
        const defineBubble = document.getElementById(type);
        result = await define(selectedText);
        defineBubble.innerHTML = '';
        defineBubble.innerHTML = `
        <div class="bubble-title">Define</div>
        <div class="bubble-content">${formatTextResponse(result) || "Error fetching result."}</div>
        <footer class="bubble-footer">
            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
        </footer>
        `;
    }
    else if (type === "analysisBubble") {
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

// Function to update the character count
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

// Function to display error when analyze button is pressed and conditions are met
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

// Function that formats response from model
function formatTextResponse(response) {
    // Replace `##text` with ``
    let htmlData = response.replace(/## (.*?)(?=\n|$)/g, "");

    // Replace `**text**` with `<strong>text</strong>`
    htmlData = htmlData.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Replace single `*` at the start of a line with a bullet point
    htmlData = htmlData.replace(/^\s*\*\s+/gm, "• ");

    // Replace remaining single `*text*` with `<em>text</em>` (italic)
    htmlData = htmlData.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Convert line breaks to HTML <br> tags
    htmlData = htmlData.replace(/\n/g, "<br>");

    return htmlData;
}

// Function checks if summary exists and notify popup
function checkSummary() {
    const summary = document.getElementById('summary');
    return summary.innerText !== "";
}

// Function that gets output from chat bot
async function getChatBotOutput(input, retries = 10, delay = 1000) {
    let result = '';
    let attempt = 0;

    if (modelInstance) {

        // Retry logic: Try initializing the model up to the specified number of retries
        while (attempt < retries) {
            try {

                // Attempt to initialize the model with the current chunk of content
                result = await modelInstance.prompt(input);
                chrome.runtime.sendMessage({ action: "setChatBotOutput", output: formatTextResponse(result) });
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
    }
}