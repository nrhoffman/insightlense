/**
 * Displays a bubble for fact-checking, defining, or analyzing text.
 * If a bubble element of the specified type doesn't exist, it creates one.
 * The bubble is positioned near the selected text and draggable. It can be closed by double-clicking.
 * 
 * @param {string} type - The type of bubble to display (e.g., 'factCheckBubble', 'defineBubble', 'analysisBubble').
 */
export async function populateBubble(type) {
    let bubble = document.querySelector(`.${type}`);
    if (!bubble) {
        bubble = document.createElement("div");
        bubble.id = `${type}`;
        bubble.classList.add(`${type}`);
        document.body.appendChild(bubble);
    }

    // Get selection position to place bubble
    const selection = window.getSelection();
    const selectedText = selection.toString();
    const range = selection.getRangeAt(0).getBoundingClientRect();
    bubble.style.top = `${window.scrollY + range.top - bubble.offsetHeight - 8}px`;
    bubble.style.left = `${window.scrollX + range.left}px`;

    const summaryEl = document.getElementById('summary');

    // Close bubble on double-click and make it draggable
    bubble.addEventListener("dblclick", () => bubble.remove(), { once: true });
    makeBubbleDraggable(bubble);

    if (type !== "defineBubble") {

        // Display error if summary is empty
        if (summaryEmpty()) {
            displayErrorSummary(bubble);
            return "Error";
        } else { 
            bubble.style.color = '#ffffff'; 
        }
    }
    else{

        // Display error message if more than 100 characters selected for definition
        if (selectedText.length > 100) {
            displayErrorDefine(bubble);
            return "Error";
        } else { 
            bubble.style.color = '#ffffff'; 
        }
    }

    if (type === "factCheckBubble") {
        
        // Display error message if more than 1000 characters for fact check
        if (selectedText.length > 1000) {
            displayErrorFactCheck(bubble);
            return "Error";
        } else { 
            bubble.style.color = '#ffffff'; 
        }
    }

    // Populate bubble content based on type
    if (type === 'factCheckBubble') { fillInFactCheckBubble(bubble); }
    else if (type === 'defineBubble') { fillInDefineBubble(bubble); }
    else if (type === 'analysisBubble') { fillInAnalysisBubble(bubble); }

    return "Pass";
}

/**
 * Manages the dragging functionality of a bubble element.
 * Calculates the position offset and updates bubble position on mouse move.
 * 
 * @param {MouseEvent} e - The mouse down event.
 * @param {HTMLElement} bubble - The bubble element to be dragged.
 * @param {number} offsetX - Horizontal offset for dragging.
 * @param {number} offsetY - Vertical offset for dragging.
 * @param {boolean} isDragging - Flag indicating if the bubble is currently being dragged.
 */
function bubbleDragging(e, bubble, offsetX, offsetY, isDragging) {
    e.preventDefault();
    isDragging = true;

    // Calculate the offset for dragging
    offsetX = e.clientX - bubble.getBoundingClientRect().left;
    offsetY = e.clientY - bubble.getBoundingClientRect().top;

    const onMouseMove = (e) => {
        if (isDragging) {
            // Update bubble position based on mouse movement
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
}

/**
 * Makes a given bubble element draggable by adding mouse event listeners.
 * 
 * @param {HTMLElement} bubble - The bubble element to make draggable.
 */
function makeBubbleDraggable(bubble) {
    let offsetX, offsetY;
    let isDragging = false;

    bubble.addEventListener("mousedown", (e) => bubbleDragging(e, bubble, offsetX, offsetY, isDragging));
}

/**
 * Checks if a summary has been generated and returns the status.
 * @returns {boolean} - True if the summary is empty, false otherwise.
 */
function summaryEmpty() {
    const summary = document.getElementById('summary');
    return (summary.innerText === "Open the popup, optionally enter a focus, and click summarize." || 
            summary.innerText === "");
}

/**
 * Displays an error message in a bubble when a summary is not available.
 * Sets the bubble text to inform the user to wait until summary generation is complete.
 * 
 * @param {HTMLElement} bubble - The bubble element in which to display the error message.
 */
function displayErrorSummary(bubble) {
    bubble.style.color = 'red';
    bubble.innerHTML = `
    <div class="bubble-title">Error</div>
    <div class="bubble-content">Wait until summary generation completes.</div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag The Window<br>Double Click Bubble To Close The Window</small>
    </footer>
    `;
}

/**
 * Displays an error message in the define bubble when selected characters is more than 100.
 * Sets the bubble text to inform the user to select less than 100 characters.
 * 
 * @param {HTMLElement} bubble - The bubble element in which to display the error message.
 */
function displayErrorDefine(bubble) {
    bubble.style.color = 'red';
    bubble.innerHTML = `
    <div class="bubble-title">Error</div>
    <div class="bubble-content">Intention for define is for words and phrases less than 100 characters.</div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag The Window<br>Double Click Bubble To Close The Window</small>
    </footer>
    `;
}

/**
 * Displays an error message in the fact check bubble when selected characters is more than 1000.
 * Sets the bubble text to inform the user to select less than 1000 characters.
 * 
 * @param {HTMLElement} bubble - The bubble element in which to display the error message.
 */
function displayErrorFactCheck(bubble) {
    bubble.style.color = 'red';
    bubble.innerHTML = `
    <div class="bubble-title">Error</div>
    <div class="bubble-content">Intention for fact check is to fact check bodies of text less than 1000 characters.</div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag The Window<br>Double Click Bubble To Close The Window</small>
    </footer>
    `;
}

/**
 * Populates a fact-check bubble with a loading message for fact-checking.
 * Content changes once fact-checking results are available.
 * 
 * @param {HTMLElement} bubble - The bubble element to populate with fact-check content.
 */
function fillInFactCheckBubble(bubble) {
    bubble.innerHTML = `
    <div class="bubble-title">Fact Checker</div>
    <div class="bubble-content">Checking facts...</div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
    </footer>
    `;
}

/**
 * Populates a definition bubble with a loading message for fetching the definition.
 * Content changes once the definition is available.
 * 
 * @param {HTMLElement} bubble - The bubble element to populate with definition content.
 */
function fillInDefineBubble(bubble) {
    bubble.innerHTML = `
    <div class="bubble-title">Define</div>
    <div class="bubble-content">Fetching definition...</div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
    </footer>
    `;
}

/**
 * Populates an analysis bubble with an input area and controls for text analysis.
 * Provides a character count display and button to initiate analysis.
 * 
 * @param {HTMLElement} bubble - The bubble element to populate with analysis content.
 */
function fillInAnalysisBubble(bubble) {
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
}
