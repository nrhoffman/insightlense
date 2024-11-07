const summarizeButton = document.getElementById('summarizeButton');
const sendButton = document.getElementById('sendButton');
const analyzeButton = document.getElementById('analyzeButton');
const chatWindow = document.getElementById('chatWindow');
const outputElement = document.createElement('p');
const loadingSpinner = document.getElementById('loadingSpinner');

// Listener for messages from sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  outputElement.className = 'bot-p';

  switch (request.action) {

    // Activates analysis button when summary generation is complete
    case "activateSummaryButton":
      summarizeButton.disabled = false;
      break;

    // Turns off loading circle when analysis is complete
    case "turnOffLoadingCircle":
      loadingSpinner.style.display = 'none';
      document.getElementById('loadingContainer').classList.remove('active');
      break;

    // Activates analysis button when summary generation is complete
    case "activateAnalyzeButton":
      analyzeButton.disabled = false;
      analyzeButton.innerText = 'Analyze';
      break;

    // Activates chat bot send button when model is ready
    case "activateSendButton":
      sendButton.disabled = false;
      chatWindow.innerHTML = '';
      outputElement.textContent = `Chatbot: I'm ready for any questions.`;

      // Append the new output element to the chat window
      chatWindow.appendChild(outputElement);
      break;

    // Adds output message to chat
    case "setChatBotOutput":
      sendButton.disabled = false;
      outputElement.textContent = `Chatbot: ${request.output}`;

      // Append the new output element to the chat window
      chatWindow.appendChild(outputElement);

      // Scroll to the bottom of the chat window
      chatWindow.scrollTop = chatWindow.scrollHeight;
      break;
  }
});

// Run when popup is opened
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const tabId = tabs[0].id;

  // Inject script and CSS once when popup opens
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["./sidebar/content.js"]
  });

  await chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ["./sidebar/sidebar.css"]
  });

  // Send the message to show sidebar after script injection
  chrome.tabs.sendMessage(tabId, { action: "showSidebar", tabId: tabId });

  // Fetches selected content from web page
  const pageContent = await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: getSelectionContent,
  });

  // Checks the amount of characters selected
  const currentCharCount = document.getElementById('currentCharCount');
  if (pageContent[0].result.length > 0) {
    currentCharCount.textContent = `(Current Characters Selected: ${pageContent[0].result.length})`;
    if (pageContent[0].result.length > 4000) {
      currentCharCount.style.color = 'red';
    } else {
      currentCharCount.style.color = 'white';
    }
  } else {
    currentCharCount.innerText = `(Current Characters Selected: 0)`;
  }

  // Send the message to check on statuses
  const status = await chrome.tabs.sendMessage(tabId, { action: "getStatuses", tabId: tabId });
  console.log(status);

  // If Initialization isn't running, run it
  if (status.initializationStatus === "yes") {

    // Send the message to initialize model
    chrome.tabs.sendMessage(tabId, { action: "initializeModel", tabId: tabId });
  }

  // If model is ready, activate chatbot
  if (status.modelStatus === "yes") {
    sendButton.disabled = false;
    chatWindow.innerHTML = '';
    outputElement.textContent = `Chatbot: I'm ready for any questions.`;

    // Append the new output element to the chat window
    chatWindow.appendChild(outputElement);
  }

  // If model is ready and there isn't a summarization or analysis in progress, activate summary and analysis buttons
  if (status.modelStatus === "yes" && status.summarizationStatus === "yes" && status.analysisStatus === "yes") {
    summarizeButton.disabled = false;
  }

  // If analysis isn't running and there's a summay, active analysis button
  if (status.analysisStatus === "yes" && status.summaryGenStatus == "yes") {
    analyzeButton.disabled = false;
    analyzeButton.innerText = 'Analyze';
  }

  // If analysis is going on turn on loading wheel
  else if (status.analysisStatus === "no") {
    loadingSpinner.style.display = 'inline-block';
    document.getElementById('loadingContainer').classList.add('active');
  }

});

// Summarize button is pressed
document.getElementById('summarizeButton').addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const userInput = document.getElementById('userInput');

    // Update Analyze Button State
    analyzeButton.innerText = 'Analyze After Summary Generation';
    analyzeButton.disabled = true;
    summarizeButton.disabled = true;

    console.log("Sending summarize message...");
    chrome.tabs.sendMessage(tabs[0].id, { action: "summarizeContent", focusInput: userInput.value });
  });
});

// Analyze button is pressed
document.getElementById('analyzeButton').addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const pageContent = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: getSelectionContent,
    });

    const filteredText = pageContent[0].result
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

    loadingSpinner.style.display = 'inline-block';
    document.getElementById('loadingContainer').classList.add('active');
    analyzeButton.disabled = true;
    summarizeButton.disabled = true;
    sendToSidebar(filteredText);
  });
});

// Send button for chat bot is pressed
document.getElementById('sendButton').addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const userInput = document.getElementById('chatInput');
    const chatWindow = document.getElementById('chatWindow');
    const input = userInput.value;
    userInput.value = '';

    // Update Send Button State
    const sendButton = document.getElementById('sendButton');
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
});

// Function to fetch the selected content of the webpage
function getSelectionContent() {
  const contentElements = window.getSelection();
  return contentElements.toString();
}

// Function to display error when analyze button is pressed and conditions are met
function displayError(message) {
  const analyzeBoxContainer = document.querySelector('.box-container:nth-of-type(2)');
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

// Function to send data to sidebar for analysis and population
function sendToSidebar(pageData) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    console.log("Sending data for analysis...");
    chrome.tabs.sendMessage(tabId, { action: 'analyzeContent', tabId: tabId, pageData: pageData });
  });
}