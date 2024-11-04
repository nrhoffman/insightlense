console.log("Content script loaded");

// Listener for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    switch (request.action) {
        case "showSidebar":
            createSidebar();
            checkSummaryAndNotify();
            break;
        case 'summarizeContent':
            summarizeContent(request.focusInput);
            break;
        case 'analyzeContent':
            analyzeContent(request.pageData);
            break;
        case 'displayBubble':
            displayFactCheckBubble(request.selectedText);
            break;
    }
});

// Function that creates or shows the sidebar
async function createSidebar() {
    let sidebar = document.getElementById('insightSidebar') || createSidebarElement();
    sidebar.style.display = 'block'; // Show the sidebar

    // Event listener for close button
    document.getElementById('closeSidebarBtn').addEventListener('click', () => {
        sidebar.style.display = 'none';
    });
}

// Helper function to create sidebar element
function createSidebarElement() {
    const sidebar = document.createElement('div');
    sidebar.id = 'insightSidebar';
    sidebar.innerHTML = `
        <button id="closeSidebarBtn">✖️</button>
        <h3>Summary</h3>
        <p id="summary"></p>
        <h3>Analysis</h3>
        <p id="analysis">Highlight text on webpage and click "Analyze" in the popup to analyze.</p>
    `;
    document.body.appendChild(sidebar);
    return sidebar;
}

// Function checks if summary exists and notify popup
function checkSummaryAndNotify() {
    const summary = document.getElementById('summary');
    if (summary.innerText !== "") { chrome.runtime.sendMessage({ action: "activateAnalyzeButton" }); }
}

// Function fills the sidebar with a summary
async function summarizeContent(focusInput) {
    const summary = document.getElementById('summary');
    summary.innerHTML = '';

    const loadingSpinner = getOrCreateLoadingSpinner(summary);

    const pageContent = await getPageContent();
    const combinedSummary = await generateSummary(pageContent, focusInput);
    loadingSpinner.remove();

    summary.innerHTML = `<span>${combinedSummary.replace(/\*/g, '')}</span>`;
    chrome.runtime.sendMessage({ action: "activateAnalyzeButton" });
}

// Helper function to get or create a loading spinner
function getOrCreateLoadingSpinner(parent) {
    let loadingSpinner = document.getElementById('loadingSpinner');
    if (!loadingSpinner) {
        loadingSpinner = document.createElement('div');
        loadingSpinner.id = 'loadingSpinner';
        loadingSpinner.classList.add('spinner');
        parent.parentElement.insertBefore(loadingSpinner, parent);
    }
    return loadingSpinner;
}

// Function that fetches the web page content
async function getPageContent() {
    const mainContent = document.querySelector('article, main, section.content, div.article, div.post, div.entry') || document;
    const contentElements = mainContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');

    return Array.from(contentElements)
        .map(element => element.innerText.trim())
        .filter(text => text.length > 0)
        .join('\n');
}

// Function that generates the summary
async function generateSummary(pageContent, focusInput) {
    const maxChar = 3800;
    if (pageContent.length > maxChar) {
        const separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(line => line.split(" ").length - 1 >= 3);
        return await getSummary(separateLines, maxChar, focusInput);
    } else {
        return await summarizePageContent(pageContent, focusInput);
    }
}

// Helper function to summarize the page content in one pass
async function summarizePageContent(pageContent, focusInput) {
    const summarizer = await ai.summarizer.create({ sharedContext: getSummaryContext(focusInput) });
    const combinedSummary = await summarizer.summarize(pageContent);
    summarizer.destroy();
    return combinedSummary;
}

// Function that breaks web content into sections for summarization
async function getSummary(separateLines, maxChar, focusInput) {
    let pageArray = [];
    let curEl = '';

    const summarizer = await ai.summarizer.create({ sharedContext: getSummaryContext(focusInput) });

    for (const line of separateLines) {
        if ((curEl + line).length < maxChar) {
            curEl += line + '\n';
        } else {
            const summary = await summarizer.summarize(curEl.trim());
            pageArray.push(summary);
            curEl = line + '\n';
        }
    }

    if (curEl.trim().length > 0) {
        const summary = await summarizer.summarize(curEl.trim());
        pageArray.push(summary);
    }

    const combinedSummaryInput = pageArray.join('\n');
    const combinedSummary = await summarizer.summarize(`Combine everything and summarize into a paragraph: ${combinedSummaryInput.trim()}`);
    summarizer.destroy();
    return combinedSummary;
}

// Helper function to get shared context for summarization
function getSummaryContext(focusInput) {
    return `Only output in English.
            Only output in trained language.
            Use paragraph form.
            Only summarize the content.
            Focus the summary on: "${focusInput}" if not blank.`;
}

// Function that populates the analysis portion of the sidebar
async function analyzeContent(pageData) {
    const htmlData = await analyzePageText(pageData);

    const analysisContent = document.getElementById('analysis');
    analysisContent.innerHTML = '';
    analysisContent.innerHTML = `<span>${htmlData}</span>`;

    chrome.runtime.sendMessage({ action: "turnOffLoadingCircle" });
}

// Function that populates the analysis portion of the sidebar
async function analyzeContent(pageData) {
    const analysisContent = document.getElementById('analysis');
    analysisContent.innerHTML = `<span>${await analyzePageText(pageData)}</span>`;
    chrome.runtime.sendMessage({ action: "turnOffLoadingCircle" });
}

// Function that analyzes web page content
async function analyzePageText(pageData) {
    const summary = document.getElementById('summary').textContent;
    const session = await ai.languageModel.create({ systemPrompt: getAnalysisPrompt(summary) });

    const result = await session.prompt(`Analyze: "${pageData}"`);
    session.destroy();
    
    return formatTextResponse(result);
}

// Helper function to get the analysis prompt
function getAnalysisPrompt(summary) {
    return `You will be given text to analyze with the given context: ${summary}

            Only use English.
            Ignore text you're not trained on.
            Don't output language you're not trained on.
            Bold Titles.
            Analyze the text and output in this exact format without including what's in parantheses:
                1. Attributes:
                - Sentiment(e.g., Positive, Negative, Neutral): Explanation
                - Emotion(What emotion can be interpreted from the text): Explanation
                - Toxicity(e.g., High, Moderate, Low, None): Explanation
                - Truthfulness(e.g., High, Moderate, Low, Uncertain): Explanation
                - Bias(e.g., High, Moderate, Low, None): Explanation
                
                2. Logical Falacies: (Identify any logical fallacies present and provide a brief explanation for each)
                - [List of logical fallacies and explanations]
                
                3. Ulterior Motives: (Assess if there are any ulterior motives behind the text and explain)
                - [List of potential ulterior motives]

                4. Overall Analysis: (Provide an overall analysis of the text)
                - [Detailed analysis of the implications and context of the text]
            
            Again: Do NOT include what is in parantheses in the format.
        `;
}

// Function that displays fact check bubble
async function displayFactCheckBubble(selectedText) {
    let bubble = document.querySelector(".factCheckBubble");
    if (!bubble) {
        bubble = document.createElement("div");
        bubble.id = "factCheckBubble";
        bubble.classList.add("factCheckBubble");
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

    // Error message if the summary is empty
    if (summaryEl.innerText === "") {
        displayErrorMessage(bubble);
        return;
    }
    else { bubble.style.color = '#ffffff'; }

    // Placeholder text while loading fact check result
    bubble.innerHTML = `
    <div class="bubble-title">Fact Checker</div>
    <div class="bubble-content">Checking facts...</div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
    </footer>
    `;

    let result = '';
    try {
        const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
        if (available !== "no") {
            const session = await ai.languageModel.create({
                systemPrompt: getFactCheckPrompt(summary)
            });

            // Fetch result - Further lines format the result properly
            result = await session.prompt(`Analyze: "${selectedText}"`);

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
    bubble.innerHTML = `
    <div class="bubble-title">Fact Checker</div>
    <div class="bubble-content">${result || "Error fetching result."}</div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
    </footer>
    `;
}

// Function to make the bubble draggable
function makeBubbleDraggable(bubble) {
    let offsetX, offsetY;

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

function displayErrorMessage(bubble){
    bubble.style.color = 'red';
    bubble.innerHTML = `
    <div class="bubble-title">Fact Checker</div>
    <div class="bubble-content">Error: Wait until summary generation completes.</div>
    <footer class="bubble-footer">
        <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
    </footer>
    `;
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