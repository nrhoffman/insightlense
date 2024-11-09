let listenersInitialized = false;  // Flag to check if listeners are initialized

const summarizeButton = document.getElementById('summarizeButton');
const sendButton = document.getElementById('sendButton');
const checkboxes = document.querySelectorAll('input[name="readingLevel"]');
const rewriteButton = document.getElementById('rewriteButton');
const chatWindow = document.getElementById('chatWindow');
const outputElement = document.createElement('p');

/**
 * Listener function for messages from the sidebar. This processes specific actions 
 * from the sidebar, enabling/disabling buttons and updating the chat window.
 *
 * @param {Object} request - Contains the action type and any data sent from the sidebar.
 * @param {Object} sender - Information about the sender of the message.
 * @param {function} sendResponse - Function to send a response back to the sender.
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
      sendButton.disabled = false;
      chatWindow.innerHTML = '';
      outputElement.textContent = "Chatbot: I'm ready for any questions.";

      // Append the new output element to the chat window
      chatWindow.appendChild(outputElement);
      break;
    case "setChatBotOutput":
      sendButton.disabled = false;
      outputElement.innerHTML = `Chatbot: ${request.output}`;

      // Append the new output element to the chat window
      chatWindow.appendChild(outputElement);

      // Scroll to the bottom of the chat window
      chatWindow.scrollTop = chatWindow.scrollHeight;
      break;
  }
};

/**
 * Initializes message and button click listeners if they have not been initialized yet.
 * Ensures that listeners are only attached once to avoid duplicate actions.
 */
function initializeListeners() {
  if (!listenersInitialized) {
    chrome.runtime.onMessage.addListener(onMessageListener);
    listenersInitialized = true;

    // Attach button listeners for summarize and send buttons
    summarizeButton.addEventListener('click', summarizeContent);
    rewriteButton.addEventListener('click', rewriteContent);
    sendButton.addEventListener('click', sendChatMessage);
  }
}

/**
 * Removes message and button click listeners to prevent memory leaks.
 * Ensures that listeners are detached when the popup closes.
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

// Ensure listeners are cleaned up when the popup closes (or window is removed)
chrome.windows.onRemoved.addListener(removeListeners);

// Run when popup is opened
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

  // Inject script and CSS once when popup opens
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["./dist/content.bundle.js"]
  });

  await chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ["./content/sidebar/sidebar.css"]
  });

  // Send the message to show sidebar after script injection
  chrome.tabs.sendMessage(tabId, { action: "showSidebar", tabId: tabId });

  // Send the message to check on statuses
  const status = await chrome.tabs.sendMessage(tabId, { action: "getStatuses", tabId: tabId });
  console.log(status);

  // If Initialization isn't running, run it
  if (status.initializationStatus === "no") {
    // Send the message to initialize model
    chrome.tabs.sendMessage(tabId, { action: "initializeModel", tabId: tabId });
  }

  // If model is ready, activate chatbot
  if (status.modelStatus === "yes") {
    sendButton.disabled = false;
    chatWindow.innerHTML = '';
    outputElement.textContent = "Chatbot: I'm ready for any questions.";

    // Append the new output element to the chat window
    chatWindow.appendChild(outputElement);
  }

  // If model is ready and there isn't a summarization or analysis in progress, activate summary and analysis buttons
  if (status.modelStatus === "yes" && status.summarizationStatus === "yes" &&
    status.analysisStatus === "yes" && status.rewriteStatus === "yes") {
    summarizeButton.disabled = false;
  }

  // If model is ready and there isn't a summarization or analysis in progress, activate summary and analysis buttons
  if (status.summaryGenStatus === "no" && status.summarizationStatus === "yes" &&
    status.analysisStatus === "yes" && status.rewriteStatus === "yes") {
    rewriteButton.disabled = false;
    rewriteButton.textContent = "Rewrite";
  }

  // Initialize listeners
  initializeListeners();
});

/**
 * Handles the click event for the summarize button. Sends a message to the content
 * script to start summarizing the selected content. Updates the button state to disabled
 * while the summarization is in progress.
 */
async function summarizeContent() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const userInput = document.getElementById('userInput');

    // Update Summarize Button State
    summarizeButton.disabled = true;
    rewriteButton.disabled = true;

    console.log("Sending summarize message...");
    chrome.tabs.sendMessage(tabs[0].id, { action: "summarizeContent", focusInput: userInput.value });
  });
}

/**
 * Handles the click event for the rewrite button. Sends a message to the content
 * script to start rewriting content. Updates the button state to disabled
 * while the rewrite is in progress.
 */
async function rewriteContent() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {

    // Get the selected reading level from the checkboxes
    let selectedReadingLevel = '';
    const childrenCheckbox = document.getElementById('childrenLevel');
    const collegeCheckbox = document.getElementById('collegeLevel');
    const currentCheckbox = document.getElementById('currentLevel');

    if (childrenCheckbox.checked) {
      selectedReadingLevel = `a children's reading level`;
    } else if (collegeCheckbox.checked) {
      selectedReadingLevel = 'a college reading level';
    } else if (currentCheckbox.checked) {
      selectedReadingLevel = `the reading level it's currently at`;
    }

    // Update Summarize and Rewrite Button State
    summarizeButton.disabled = true;
    rewriteButton.disabled = true;

    console.log("Sending rewrite message...");
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "rewriteContent",
      readingLevel: selectedReadingLevel
    });
  });
}

/**
 * Handles the click event for the send button in the chat window. Sends the user’s input 
 * message to the chatbot for a response. Updates the chat window to display the user’s 
 * message and handles UI scrolling and button state.
 */
async function sendChatMessage() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const userInput = document.getElementById('chatInput');
    const chatWindow = document.getElementById('chatWindow');
    const input = userInput.value;
    userInput.value = '';

    // Update Send Button State
    sendButton.disabled = true;

    // Create a new paragraph element for the input
    const inputElement = document.createElement('p');
    inputElement.className = 'user-p';
    inputElement.textContent = `User: ${input}`;

    // Append the new output element to the chat window
    chatWindow.appendChild(inputElement);

    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;

    chrome.tabs.sendMessage(tabs[0].id, { action: "getChatBotOutput", chatInput: input });
  });
}