/**
 * Handles the Analyze button click event.
 * It checks the selected text, validates it, removes the button, and triggers the analysis.
 * @param {function} analyzeContent - The function to analyze the selected content.
 */
export async function analyzeButtonHandler(analyzeContent) {
    // Get the necessary DOM elements
    const analyzeBubble = document.getElementById('analysisBubble');
    const analyzeButton = document.getElementById('analyzeButton');
    
    // Get the selected text and filter out empty lines or long selections
    const selectedText = window.getSelection().toString();
    const filteredText = selectedText.split('\n')
        .filter(line => (line.match(/ /g) || []).length >= 8)  // Ensure lines are long enough
        .join('\n');
    
    // Check if the selected text is empty or too long (over 4000 characters)
    if (filteredText.length === 0 || filteredText.length > 4000) {
        displayErrorMessage(filteredText.length === 0 ? "Error: Text must be highlighted." : "Error: Selected characters must be under 4000.");
        return;
    }

    // Remove the analyze button and other elements while processing
    analyzeButton.remove();
    document.querySelector('.analysisBubble #currentCharCount').remove();
    document.querySelector('.analysisBubble #bubbleText').innerText = "Analysis will go to sidebar.";
    
    // Wait briefly before removing the analyze bubble
    await new Promise(r => setTimeout(r, 3000));
    analyzeBubble.remove();

    // Call the analyzeContent function with the filtered text
    analyzeContent(filteredText);
}

/**
 * Handles the Rewrite button click event.
 * It retrieves the selected reading level, triggers the rewrite, and updates the UI.
 * @param {function} rewriteContent - The function to rewrite the selected content.
 */
export async function rewriteButtonHandler(rewriteContent) {
    // Get the necessary DOM elements
    const rewriteBubble = document.getElementById('rewriteBubble');
    const rewriteButton = document.getElementById('rewriteButton');
    const loadingForBubble = document.getElementById('loadingContainer');
    
    // Get the selected reading level
    const selectedReadingLevel = getSelectedReadingLevel();

    // Remove the rewrite button and reading level controls during the process
    rewriteButton.remove();
    document.getElementById('reading-level').remove();
    document.querySelector('.rewriteBubble #bubbleText').innerText = "Rewrite in progress...";
    loadingForBubble.classList.add('active');

    // Call the rewriteContent function with the selected reading level
    await rewriteContent(selectedReadingLevel);
    
    // Remove the loading spinner and wait before removing the rewrite bubble
    loadingForBubble.remove();
    await new Promise(r => setTimeout(r, 3000));

    // Remove the rewrite bubble after completion
    rewriteBubble.remove();
}

/**
 * Returns the selected reading level based on which checkbox is checked.
 * Checks for children, college, or current reading level.
 * @returns {string} - The selected reading level.
 */
function getSelectedReadingLevel() {
    // Get the checkbox elements
    const childrenCheckbox = document.getElementById('childrenLevel');
    const collegeCheckbox = document.getElementById('collegeLevel');
    const currentCheckbox = document.getElementById('currentLevel');

    // Return the appropriate reading level description
    if (childrenCheckbox.checked) return `a children's reading level`;
    if (collegeCheckbox.checked) return 'a college reading level';
    if (currentCheckbox.checked) return `the reading level it's currently at`;
    return '';
}

/**
 * Displays an error message in the analysis bubble if the selected text does not meet the required conditions.
 * The message is shown above the analyze button in the analysis bubble.
 * @param {string} message - The error message to display.
 */
function displayErrorMessage(message) {
    const analyzeBubble = document.getElementById('analysisBubble');
    const analyzeBoxContainer = analyzeBubble.querySelector('.bubble-content');

    // Check if an error message already exists, otherwise create one
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
        analyzeBoxContainer.insertBefore(errorMessage, document.getElementById('analyzeButton'));
    }

    // Set the text of the error message
    errorMessage.innerText = message;
}