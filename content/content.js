import { createSidebar, getOrCreateLoadingSpinner } from './sidebar/sidebar.js';
import { generateAnalysis } from './utilities/analyze.js';
import { generateSummary } from './utilities/summarize.js';
import { getPageContent } from './utilities/getPageContent.js';
import { initializeModel } from './utilities/initializeModel.js';

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
    if(modelInstance){
        modelInstance.destroy();
        console.log("Chat Bot Model Destroyed");
    }
    document.removeEventListener("mouseup", updateCharacterCount);
    document.removeEventListener("keyup", updateCharacterCount);
});

async function initModel(){
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

// Function checks if summary exists and notify popup
function checkSummary() {
    const summary = document.getElementById('summary');
    return summary.innerText !== "";
}

// Function that gets
async function getChatBotOutput(input) {
    if(modelInstance){
        const result = await modelInstance.prompt(input);
        chrome.runtime.sendMessage({ action: "setChatBotOutput", output: result });
    }
    else{
        chrome.runtime.sendMessage({ action: "setChatBotOutput", output: "Error... Model crashed..." });
    }
}

// Function that displays fact check bubble
async function displayBubble(selectedText, type) {
    let bubble = document.querySelector(`.${type}`);
    if (!bubble) {
        bubble = document.createElement("div");
        bubble.id = `${type}`;
        bubble.classList.add(`${type}`);
        document.body.appendChild(bubble);
    }

    // Get selection position to place bubble
    const selection = window.getSelection();
    const range = selection.getRangeAt(0).getBoundingClientRect();
    bubble.style.top = `${window.scrollY + range.top - bubble.offsetHeight - 8}px`;
    bubble.style.left = `${window.scrollX + range.left}px`;

    const summaryEl = document.getElementById('summary');
    const summary = summaryEl.textContent;

    // Close bubble on click
    bubble.addEventListener("dblclick", () => bubble.remove());
    makeBubbleDraggable(bubble);

    if (type !== "defineBubble") {
        // Error message if the summary is empty
        if (summaryEl.innerText === "") {
            displayErrorMessage(bubble);
            return;
        }
        else { bubble.style.color = '#ffffff'; }
    }

    if (type === 'factCheckBubble' || type === 'defineBubble') { await fillInBubble(bubble, type, summary, selectedText); }
    else if (type === 'analysisBubble') { fillInAnalysisBubble(bubble, summary, selectedText); }
}

// Function to make the bubble draggable
function makeBubbleDraggable(bubble) {
    let offsetX, offsetY;
    let isDragging = false;

    bubble.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isDragging = true;

        // Calculate the offset
        offsetX = e.clientX - bubble.getBoundingClientRect().left;
        offsetY = e.clientY - bubble.getBoundingClientRect().top;

        const onMouseMove = (e) => {
            if (isDragging) {
                // Update bubble's position based on mouse movement
                bubble.style.left = `${e.pageX - offsetX}px`;
                bubble.style.top = `${e.pageY - offsetY}px`;
            }
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            isDragging = false;
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
}

function displayErrorMessage(bubble) {
    bubble.style.color = 'red';
    bubble.innerHTML = `
    <div class="bubble-title">Error</div>
    <div class="bubble-content">Wait until summary generation completes.</div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
    </footer>
    `;
}

async function fillInBubble(bubble, type, summary, selectedText) {
    // Placeholder text while loading fact check result
    if (type === 'factCheckBubble') {
        bubble.innerHTML = `
        <div class="bubble-title">Fact Checker</div>
        <div class="bubble-content">Checking facts...</div>
        <footer class="bubble-footer">
            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
        </footer>
        `;
    }

    // Placeholder text while loading definition result
    else {
        bubble.innerHTML = `
        <div class="bubble-title">Define</div>
        <div class="bubble-content">Fetching definition...</div>
        <footer class="bubble-footer">
            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
        </footer>
        `;
    }
    
    let result = '';
    try {
        const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
        if (available !== "no") {
            let session = null;

            // Fetch result - Further lines format the result properly
            if (type === 'factCheckBubble') {
                session = await ai.languageModel.create({
                    systemPrompt: getFactCheckPrompt(summary)
                });
                result = await session.prompt(`Analyze: "${selectedText}"`);
            }
            else {
                session = await ai.languageModel.create({
                    systemPrompt: "Give the definition"
                });
                result = await session.prompt(`Define: "${selectedText}"`);
            }

            result = formatTextResponse(result);

            session.destroy();
        }
    } catch (error) {
        if (error.message === "Other generic failures occurred.") {
            result = `Other generic failures occurred. Retrying...`;
        }
        else { result = error.message; }
        console.error("Error generating content:", error);
    }

    bubble.innerHTML = '';
    if (type === 'factCheckBubble') {
        bubble.innerHTML = `
        <div class="bubble-title">Fact Checker</div>
        <div class="bubble-content">${result || "Error fetching result."}</div>
        <footer class="bubble-footer">
            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
        </footer>
        `;
    }
    else {
        bubble.innerHTML = `
        <div class="bubble-title">Define</div>
        <div class="bubble-content">${result || "Error fetching result."}</div>
        <footer class="bubble-footer">
            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
        </footer>
        `;
    }
}

function getFactCheckPrompt(summary) {
    return `You will be given text to fact-check with the given context: ${summary}

            Only use English.
            Ignore text you're not trained on.
            Don't output language you're not trained on.
            Bold Titles.
            Fact check the text and output in this exact format without including what's in parantheses:
                Fact Check Result: (True, Partially True, False, Unverified, Opinion)

                Explanation: (Give an explanation of the fact check)
            
            Again: Do NOT include what is in parantheses in the format.
        `;
}

function fillInAnalysisBubble(bubble, summary, selectedText) {
    bubble.innerHTML = '';
    bubble.innerHTML = `
    <div class="bubble-title">Analyze</div>
    <div class="bubble-content">
        <div id="bubbleText">Max Character Count: 4000</div>
        <div id="currentCharCount">Current Characters Selected: 0</div>
        <button id="analyzeButton">Analyze</button>
    </div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
    </footer>
    `;

    const analyzeButton = bubble.querySelector('#analyzeButton');

    const analyzeButtonClickHandler = async () => {
        analyzeButton.removeEventListener('click', analyzeButtonClickHandler);
    
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
    
        bubble.remove();
        await analyzeContent(filteredText);

    }

    // Analyze button is pressed
    analyzeButton.addEventListener('click', analyzeButtonClickHandler);
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