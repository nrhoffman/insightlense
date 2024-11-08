// Function that displays fact check bubble
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

    if (type === 'factCheckBubble') { fillInFactCheckBubble(bubble); }
    else if (type === 'defineBubble') { fillInDefineBubble(bubble); }
    else if (type === 'analysisBubble') { fillInAnalysisBubble(bubble); }
}

export function bubbleDragging(e, bubble, offsetX, offsetY, isDragging){
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
}

// Function to make the bubble draggable
function makeBubbleDraggable(bubble) {
    let offsetX, offsetY;
    let isDragging = false;

    bubble.addEventListener("mousedown", (e) => bubbleDragging(e, bubble, offsetX, offsetY, isDragging));
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

function fillInFactCheckBubble(bubble) {

    // Placeholder text while loading fact check result
    bubble.innerHTML = `
    <div class="bubble-title">Fact Checker</div>
    <div class="bubble-content">Checking facts...</div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
    </footer>
    `;
}

function fillInDefineBubble(bubble) {

    // Placeholder text while loading definition result
    bubble.innerHTML = `
    <div class="bubble-title">Define</div>
    <div class="bubble-content">Fetching definition...</div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
    </footer>
    `;
}

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