let listenersInitialized = false;
let typingInterval = null;

const summarizeButton = document.getElementById('summarizeButton');
const sendButton = document.getElementById('sendButton');
const chatWindow = document.getElementById('chatWindow');
const userInput = document.getElementById('chatInput');

/**
 * Message listener function to handle sidebar communication with the content script.
 * This function listens for specific actions from the content script and updates the UI accordingly.
 */
const onMessageListener = (request, sender, sendResponse) => {
    switch (request.action) {
        case "activateButtons":
            // Enable the summarize and send buttons
            summarizeButton.disabled = false;
            sendButton.disabled = false;
            break;
        case "initChatWindow":
            // Initialize chat window when requested
            initChatWindow();
            break;
        case "sendStatus":
            // Update button states based on the current model status
            updateButtonStates(request.status);
            break;
        case "setChatBotOutput":
            // Display the chatbot's response in the chat window
            setChatBotOutput(request.output);
            break;
    }
};

/**
 * Initializes the chat window, retrieves previous conversation from storage, 
 * and displays it. If no conversation exists, shows a default bot message.
 */
function initChatWindow() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url; // Get the current tab's URL
        
        // Retrieve the saved conversation for the current URL
        chrome.storage.local.get([url], (result) => {
            const messages = result[url] || [];

            // Clear the chat window
            chatWindow.innerHTML = '';

            // Add each message to the chat window
            messages.forEach(msg => {
                const messageElem = document.createElement('div');
                messageElem.className = msg.className;
                messageElem.textContent = msg.text;
                chatWindow.appendChild(messageElem);
            });

            // Append a starting bot message if chat is empty
            if (messages.length === 0) {
                const botMessage = document.createElement('div');
                botMessage.className = 'bot-message';
                botMessage.textContent = "I'm ready for any questions.";
                chatWindow.appendChild(botMessage);
            }

            // Scroll to the bottom of the chat window
            chatWindow.scrollTop = chatWindow.scrollHeight;
        });
    });
}

/**
 * Updates the chat window with the chatbot output and scrolls to the bottom.
 * This is called when a response is received from the chatbot.
 * @param {string} output - The chatbot's response text.
 */
function setChatBotOutput(output) {
    summarizeButton.disabled = false;
    sendButton.disabled = false;

    // Stop the typing indicator animation
    clearTypingIndicatorAnimation();

    // Remove typing indicator from chat window
    const typingIndicator = chatWindow.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }

    // Create a chatbot message bubble for the output
    const botMessage = document.createElement('div');
    botMessage.className = 'bot-message';
    botMessage.innerHTML = output;

    // Append the bot message to the chat window and scroll to the bottom
    chatWindow.appendChild(botMessage);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Save the conversation to storage
    saveConversation(botMessage);
}

/**
 * Initializes message listeners and button event listeners only once to avoid duplicates.
 */
function initializeListeners() {
    if (!listenersInitialized) {
        chrome.runtime.onMessage.addListener(onMessageListener);
        listenersInitialized = true;

        // Attach button event listeners
        summarizeButton.addEventListener('click', summarizeContent);
        sendButton.addEventListener('click', sendChatMessage);
        userInput.addEventListener("keydown", function (event) {
            // Check if the key pressed is "Enter"
            if (event.key === "Enter") {
                // Prevent the default behavior (i.e., adding a new line)
                event.preventDefault();

                // Simulate a click on the send button
                sendButton.click();
            }
        });
    }
}

/**
 * Removes all message and button listeners to prevent memory leaks.
 */
function removeListeners() {
    if (listenersInitialized) {
        chrome.runtime.onMessage.removeListener(onMessageListener);
        summarizeButton.removeEventListener('click', summarizeContent);
        sendButton.removeEventListener('click', sendChatMessage);
        listenersInitialized = false;
    }
}

/**
 * Ensure listeners are removed when the popup window is closed.
 */
chrome.windows.onRemoved.addListener(removeListeners);

/**
 * Runs when the popup window is opened, initializes content, message listeners, and checks model status.
 */
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tabId = tabs[0].id;
    const url = tabs[0].url;

    // Send message to content.js to send page info to background for init
    chrome.tabs.sendMessage(tabId, { action: "sendInitMsg", tabId: tabId });

    // Inject necessary scripts and CSS when the popup opens
    chrome.tabs.sendMessage(tabId, { action: "showSidebar", tabId: tabId });

    // Send message to check status and initialize model if needed
    chrome.runtime.sendMessage({ action: "getStatuses", tabId: tabId, url: url });

    // Initialize listeners after setup
    initializeListeners();
});

/**
 * Updates button states based on the current status of the model (e.g., whether it's initialized or running).
 */
function updateButtonStates(status) {
    if (status.notRunning === "yes" && status.initialized === "yes") {
        summarizeButton.disabled = false;
        sendButton.disabled = false;
        initChatWindow();
    }
}

/**
 * Handles the summarize button click event, sends message to summarize content on the active tab.
 */
async function summarizeContent() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const userInput = document.getElementById('userInput');

        // Disable buttons during summarization
        summarizeButton.disabled = true;
        sendButton.disabled = true;

        console.log("Sending summarize message...");
        chrome.tabs.sendMessage(tabs[0].id, { action: "startingSummary", tabId: tabs[0].id, focusInput: userInput.value });
    });
}

/**
 * Handles the send button click event, sends the user's input to the chatbot for processing.
 */
async function sendChatMessage() {
    const input = userInput.value.trim();
    if (!input) return; // Prevent empty messages from being sent

    // Clear the input field and disable the send button
    userInput.value = '';
    sendButton.disabled = true;
    summarizeButton.disabled = true;

    // Create and append user message bubble to the chat window
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.textContent = input;
    chatWindow.appendChild(userMessage);

    saveConversation(userMessage);

    // Check if an existing typing indicator exists and remove it
    const existingTypingIndicator = chatWindow.querySelector('.typing-indicator');
    if (existingTypingIndicator) existingTypingIndicator.remove();

    // Create and append typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.textContent = '.'; // Start with a single dot
    chatWindow.appendChild(typingIndicator);

    // Start the typing animation
    startTypingIndicatorAnimation(typingIndicator);

    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Send the input message to the background script or content script for chatbot processing
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        chrome.runtime.sendMessage({ action: "getChatBotOutput", tabId: tabs[0].id, chatInput: input });
    });
}

/**
 * Starts an animated typing indicator that cycles between ".", "..", and "..."
 * to simulate the chatbot "typing" while processing a response.
 * @param {HTMLElement} typingIndicator - The element displaying the typing animation.
 */
function startTypingIndicatorAnimation(typingIndicator) {
    let dotCount = 1;
    clearTypingIndicatorAnimation();
    typingInterval = setInterval(() => {
        typingIndicator.textContent = '.'.repeat(dotCount); // Update the text to ".", "..", "..."
        dotCount = (dotCount % 3) + 1; // Cycle dotCount between 1 and 3
    }, 500); // Update every 500ms
}

/**
 * Stops the typing indicator animation by clearing the interval.
 */
function clearTypingIndicatorAnimation() {
    if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
    }
}

/**
 * Appends the new message to the existing conversation array in Chrome's local storage,
 * ensuring that no more than 50 messages are stored.
 * @param {HTMLElement} messageElem - The message element to be saved.
 */
function saveConversation(messageElem) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url; // Get the current tab's URL
        
        // Retrieve the existing conversation for the current URL from storage
        chrome.storage.local.get([url], (result) => {
            const messages = result[url] || [];

            // Create the new message object
            const newMessage = {
                text: messageElem.textContent,
                className: messageElem.className,
                timestamp: Date.now()
            };

            // Append the new message to the array
            messages.push(newMessage);

            // If there are more than 50 messages, remove the oldest one (FIFO)
            if (messages.length > 50) {
                messages.shift(); // Remove the first element (oldest message)
            }

            // Save the updated conversation back to local storage under the URL key
            chrome.storage.local.set({ [url]: messages });
        });
    });
}
