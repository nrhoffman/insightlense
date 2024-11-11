let listenersInitialized = false;

const summarizeButton = document.getElementById('summarizeButton');
const sendButton = document.getElementById('sendButton');
const checkboxes = document.querySelectorAll('input[name="readingLevel"]');
const rewriteButton = document.getElementById('rewriteButton');
const chatWindow = document.getElementById('chatWindow');
const outputElement = document.createElement('p');

/**
 * Message listener function to handle sidebar communication with the content script.
 */
const onMessageListener = (request, sender, sendResponse) => {
    outputElement.className = 'bot-p';

    switch (request.action) {
        case "activateSummaryButton":
            summarizeButton.disabled = false;
            break;
        case "activateRewriteButton":
            rewriteButton.disabled = false;
            rewriteButton.textContent = "Rewrite";
            break;
        case "activateSendButton":
            activateSendButton();
            break;
        case "setChatBotOutput":
            setChatBotOutput(request.output);
            break;
    }
};

/**
 * Activate the send button and display initial message.
 */
function activateSendButton() {
    sendButton.disabled = false;
    chatWindow.innerHTML = '';
    outputElement.textContent = "Chatbot: I'm ready for any questions.";
    chatWindow.appendChild(outputElement);
}

/**
 * Updates the chat window with chatbot output and scrolls to the bottom.
 */
function setChatBotOutput(output) {
    sendButton.disabled = false;
    outputElement.innerHTML = `Chatbot: ${output}`;
    chatWindow.appendChild(outputElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

/**
 * Initializes the message listeners and button event listeners only once.
 */
function initializeListeners() {
    if (!listenersInitialized) {
        chrome.runtime.onMessage.addListener(onMessageListener);
        listenersInitialized = true;

        // Attach button event listeners
        summarizeButton.addEventListener('click', summarizeContent);
        rewriteButton.addEventListener('click', rewriteContent);
        sendButton.addEventListener('click', sendChatMessage);
    }
}

/**
 * Remove all message and button listeners to prevent memory leaks.
 */
function removeListeners() {
    if (listenersInitialized) {
        chrome.runtime.onMessage.removeListener(onMessageListener);
        summarizeButton.removeEventListener('click', summarizeContent);
        rewriteButton.removeEventListener('click', rewriteContent);
        sendButton.removeEventListener('click', sendChatMessage);
        listenersInitialized = false;
    }
}

/**
 * Ensure listeners are removed when the popup window is closed.
 */
chrome.windows.onRemoved.addListener(removeListeners);

/**
 * Runs when the popup window is opened and initializes content and message listeners.
 */
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tabId = tabs[0].id;

    // Ensure only one checkbox is selected at a time
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            checkboxes.forEach(cb => {
                if (cb !== this) cb.checked = false;
            });
        });
    });

    // Inject necessary scripts and CSS when the popup opens
    await injectScripts(tabId);

    // Send message to check status and initialize model if needed
    const status = await checkStatus(tabId);

    // Initialize listeners if the model isn't running or initialized
    if (status.notRunning === "yes" && status.initialized === "no") {
        chrome.tabs.sendMessage(tabId, { action: "initializeModel", tabId: tabId });
    }

    // Update button states based on model status
    updateButtonStates(status);

    // Initialize listeners after setup
    initializeListeners();
});

/**
 * Injects the required scripts and CSS into the active tab.
 */
async function injectScripts(tabId) {
    await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["./dist/content.bundle.js"]
    });

    await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["./content/sidebar/sidebar.css"]
    });

    chrome.tabs.sendMessage(tabId, { action: "showSidebar", tabId: tabId });
}

/**
 * Check the current status of the tab to determine which actions to take.
 */
async function checkStatus(tabId) {
    return chrome.tabs.sendMessage(tabId, { action: "getStatuses", tabId: tabId });
}

/**
 * Update button states based on the current status of the model.
 */
function updateButtonStates(status) {
    if (status.initialized === "yes") {
        sendButton.disabled = false;
        chatWindow.innerHTML = '';
        outputElement.textContent = "Chatbot: I'm ready for any questions.";
        chatWindow.appendChild(outputElement);
    }

    if (status.notRunning === "yes" && status.initialized === "yes") {
        summarizeButton.disabled = false;
    }

    if (status.summarized === "yes" && status.notRunning === "yes") {
        rewriteButton.disabled = false;
        rewriteButton.textContent = "Rewrite";
    }
}

/**
 * Handles the summarize button click event, sends message to summarize content.
 */
async function summarizeContent() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const userInput = document.getElementById('userInput');

        // Disable buttons during summarization
        summarizeButton.disabled = true;
        rewriteButton.disabled = true;

        console.log("Sending summarize message...");
        chrome.tabs.sendMessage(tabs[0].id, { action: "summarizeContent", focusInput: userInput.value });
    });
}

/**
 * Handles the rewrite button click event, sends message to rewrite content.
 */
async function rewriteContent() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {

        // Get the selected reading level
        const selectedReadingLevel = getSelectedReadingLevel();

        // Disable buttons during rewrite
        summarizeButton.disabled = true;
        rewriteButton.disabled = true;
        rewriteButton.textContent = "Doesn't Currently Work";

        console.log("Sending rewrite message...");
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "rewriteContent",
            readingLevel: selectedReadingLevel
        });
    });
}

/**
 * Returns the selected reading level based on checkbox selection.
 */
function getSelectedReadingLevel() {
    const childrenCheckbox = document.getElementById('childrenLevel');
    const collegeCheckbox = document.getElementById('collegeLevel');
    const currentCheckbox = document.getElementById('currentLevel');

    if (childrenCheckbox.checked) return `a children's reading level`;
    if (collegeCheckbox.checked) return 'a college reading level';
    if (currentCheckbox.checked) return `the reading level it's currently at`;
    return '';
}

/**
 * Handles the send button click event, sends user input to the chatbot.
 */
async function sendChatMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const userInput = document.getElementById('chatInput');
        const chatWindow = document.getElementById('chatWindow');
        const input = userInput.value;
        userInput.value = '';

        // Disable send button while waiting for response
        sendButton.disabled = true;

        // Create and append user input element to chat window
        const inputElement = document.createElement('p');
        inputElement.className = 'user-p';
        inputElement.textContent = `User: ${input}`;
        chatWindow.appendChild(inputElement);

        // Scroll to the bottom of the chat window
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Send input message to chatbot
        chrome.tabs.sendMessage(tabs[0].id, { action: "getChatBotOutput", chatInput: input });
    });
}
