/**
 * Displays a bubble for fact-checking, defining, or analyzing text.
 * If a bubble element of the specified type doesn't exist, it creates one.
 * The bubble is positioned near the selected text and draggable. It can be closed by double-clicking.
 * 
 * @param {string} type - The type of bubble to display (e.g., 'factCheckBubble', 'defineBubble', 'analysisBubble').
 * @returns {string} - Returns "Pass" if everything is good, "Error" if any validation fails.
 */
export async function populateBubble(type) {
    let bubble = document.querySelector(`.${type}`);
    if (!bubble) {
        bubble = createBubble(type);
    }

    const selection = window.getSelection();
    const selectedText = selection.toString();
    const range = selection.getRangeAt(0).getBoundingClientRect();

    positionBubble(bubble, range);

    bubble.addEventListener("dblclick", () => bubble.remove(), { once: true });
    makeBubbleDraggable(bubble);

    // Error handling for different bubble types
    if (type !== "defineBubble" && type !== "rewriteBubble" && summaryEmpty()) {
        displayError(bubble, "summary");
        return "Error";
    }

    if (type === "defineBubble" && selectedText.length > 100) {
        displayError(bubble, "define");
        return "Error";
    }

    if (type === "factCheckBubble" && selectedText.length > 1000) {
        displayError(bubble, "factCheck");
        return "Error";
    }
    // Populate bubble content based on type
    switch (type) {
        case 'factCheckBubble':
            fillInFactCheckBubble(bubble);
            break;
        case 'defineBubble':
            fillInDefineBubble(bubble);
            break;
        case 'analysisBubble':
            fillInAnalysisBubble(bubble);
            break;
        case 'rewriteBubble':
            fillInRewriteBubble(bubble);
            break;
    }

    return "Pass";
}

/**
 * Creates a bubble element and appends it to the body.
 * 
 * @param {string} type - The type of bubble (e.g., 'factCheckBubble').
 * @returns {HTMLElement} - The newly created bubble element.
 */
function createBubble(type) {
    let bubble = document.createElement("div");
    bubble.id = `${type}`;
    bubble.classList.add(`${type}`);
    document.body.appendChild(bubble);
    return bubble;
}

/**
 * Positions the bubble near the selected text.
 * 
 * @param {HTMLElement} bubble - The bubble element to position.
 * @param {DOMRect} range - The bounding rectangle of the selected text.
 */
function positionBubble(bubble, range) {
    bubble.style.top = `${window.scrollY + range.top - bubble.offsetHeight - 8}px`;
    bubble.style.left = `${window.scrollX + range.left}px`;
}

/**
 * Displays an error message in the bubble based on the error type.
 * 
 * @param {HTMLElement} bubble - The bubble element where the error message will be displayed.
 * @param {string} type - The type of error (e.g., 'summary', 'define', 'factCheck').
 */
function displayError(bubble, type) {
    bubble.style.color = 'red';

    let message = "";
    switch (type) {
        case "summary":
            message = "Wait until summary generation completes.";
            break;
        case "define":
            message = "Intention for define is for words and phrases less than 100 characters.";
            break;
        case "factCheck":
            message = "Intention for fact check is to fact check bodies of text less than 1000 characters.";
            break;
    }

    bubble.innerHTML = `
        <div class="bubble-title">Error</div>
        <div class="bubble-content">${message}</div>
        <footer class="bubble-footer">
            <small>Click And Hold To Drag The Window<br>Double Click Bubble To Close The Window</small>
        </footer>
    `;
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
 * Manages the dragging functionality of a bubble element.
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

    offsetX = e.clientX - bubble.getBoundingClientRect().left;
    offsetY = e.clientY - bubble.getBoundingClientRect().top;

    const onMouseMove = (e) => {
        if (isDragging) {
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
 * Checks if a summary has been generated and returns the status.
 * @returns {boolean} - True if the summary is empty, false otherwise.
 */
function summaryEmpty() {
    const summary = document.getElementById('summary');
    return (summary.innerText === "Open the popup, optionally enter a focus, and click summarize." || 
            summary.innerText === "");
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

/**
 * Populates a rewrite bubble with checkboxes and button for content rewriting.
 * Select text, select a reading level and click the button to initiate rewrite.
 * 
 * @param {HTMLElement} bubble - The bubble element to populate with rewrite content.
 */
function fillInRewriteBubble(bubble) {
    bubble.innerHTML = `
        <div class="bubble-title">Rewrite</div>
        <div class="bubble-content">
            <div id="bubbleText">Max Character Count: 4000</div>
            <div id="currentCharCount">Current Characters Selected: 0</div>

            <div id="reading-level" class="reading-level">
                <div class="checkbox-text">Reading Level:</div>
                <div class="checkbox-container">
                    <label class="custom-checkbox">
                        <input type="checkbox" id="childrenLevel" name="readingLevel" value="children">
                        <span class="checkbox-label">Children</span>
                    </label>
                    <label class="custom-checkbox">
                        <input type="checkbox" id="collegeLevel" name="readingLevel" value="college">
                        <span class="checkbox-label">College</span>
                    </label>
                    <label class="custom-checkbox">
                        <input type="checkbox" id="currentLevel" name="readingLevel" value="current" checked>
                        <span class="checkbox-label">Current</span>
                    </label>
                </div>
            </div>

            <button id="rewriteButton">Rewrite</button>

            <div class="loading-spinner-container" id="loadingContainer">
                <div id="loadingSpinner" class="loading-spinner"></div>
            </div>
        </div>
        <footer class="bubble-footer">
            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
        </footer>
    `;
}