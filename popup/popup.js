// Run when popup is opened
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  const tabId = tabs[0].id;

  // Fetches selected content from web page
  const pageContent = await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: getPageContent,
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

  // Starts up the sidebar
  chrome.scripting.executeScript(
      {
          target: { tabId: tabId },
          files: ["./sidebar/content.js"]
      },
      () => {
          chrome.scripting.insertCSS(
              {
                  target: { tabId: tabId },
                  files: ["./sidebar/sidebar.css"]
              },
              () => {

                  // Send the message to show sidebar after script injection
                  chrome.tabs.sendMessage(tabId, { action: "showSidebar", tabId: tabId }, (response) => {
                      if (chrome.runtime.lastError) {
                          console.error("Error sending message:", chrome.runtime.lastError.message);
                      } else {
                          console.log("Message sent successfully:", response);
                      }
                  });
              }
          );
      }
  );
});

// Analyzed button is pressed
document.getElementById('analyzeButton').addEventListener('click', async () => {
  const loadingSpinner = document.getElementById('loadingSpinner');
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {

    // Fetches selected content from web page
    const pageContent = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: getPageContent,
    });

    // Filters out nonsense text
    const filteredText = pageContent[0].result
      .split('\n')
      .filter(line => (line.match(/ /g) || []).length >= 8)
      .join('\n');

    // Check if pageContent is empty or over char max
    if (filteredText.length === 0 || filteredText.length > 4000) {
      const errorText = filteredText.length === 0 
          ? "Text must be highlighted." 
          : "Selected characters must be under 4000.";
      displayError(errorText);
      return;
    }

    // Starts Loading Spinner and sends text to sidebar script
    loadingSpinner.style.display = 'inline-block';
    sendToSidebar(filteredText);
  });
});

// Function to fetch the selected content of the webpage
function getPageContent() {
  const contentElements = window.getSelection();
  return contentElements.toString(); 
}

// Function to display error when analyze button is pressed and conditions are met
function displayError(message) {
  let errorMessage = document.querySelector('.error-message');
  if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.classList.add('error-message');
      document.querySelector('.popup-container').insertBefore(errorMessage, document.getElementById('analyzeButton'));
  }
  errorMessage.innerText = message;
}

// Function to send data to sidebar for population
function sendToSidebar(pageData) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.scripting.executeScript(
      { target: { tabId: tabId }, files: ["./sidebar/content.js"] },
      () => {
        chrome.scripting.insertCSS(
          { target: { tabId: tabId }, files: ["./sidebar/sidebar.css"] },
          () => {
            chrome.tabs.sendMessage(tabId, {
              action: 'populateSidebar',
              tabId: tabId,
              pageData: pageData
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError);
              } else {
                console.log("Message sent successfully:", response);
              }
            });
          });
      }
    );
  });
}

// Listener for messages from sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // Turns off loading circle when analysis is complete
  if (request.action === "turnOffLoadingCircle") {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'none';
  }

  // Actives analysis button when summary generation is complete
  if (request.action === "activateAnalyzeButton") {
    const analyzeButton = document.getElementById('analyzeButton');
    analyzeButton.disabled = false;
    analyzeButton.innerText = 'Analyze';
  }
});