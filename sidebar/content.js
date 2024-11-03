console.log("Content script loaded");

// Listener for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const tabId = request.tabId;

    // Displays the sidebar
    if (request.action === "showSidebar") {
        createSidebar(tabId);

        // Checks if summary exists and notifies the popup script
        const summary = document.getElementById('summary');
        if (summary.innerText !== "") {
            chrome.runtime.sendMessage({ action: "activateAnalyzeButton" });
        }
    }

    // Populate the sidebar with analysis
    else if (request.action === 'populateSidebar') {
        populateSidebar(request.pageData);
    }

    // Display the fact check bubble
    else if (request.action === 'displayBubble') {
        displayFactCheckBubble(request.selectedText);
    }
});

// Function that creates the sidebar
async function createSidebar(tabId) {
    let sidebar = document.getElementById('insightSidebar');

    // Creates sidebar if it doesn't exist yet
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.id = 'insightSidebar';
        sidebar.innerHTML = `
            <button id="closeSidebarBtn">✖️</button>
            <h3>Summary</h3>
            <div id="loadingSpinner" class="spinner"></div>
            <p id="summary"></p>
            <h3>Analysis</h3>
            <p id="analysis">Highlight text on webpage and click "Analyze" in the popup to analyze.</p>
        `;
        document.body.appendChild(sidebar);

        document.getElementById('closeSidebarBtn').addEventListener('click', () => {
            sidebar.style.display = 'none';
        });

        const summary = document.getElementById('summary');
        summary.innerHTML = '';
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'block';

        // Fetches the page content
        const pageContent = await getPageContent();
        const maxChar = 3800;
        let combinedSummary;

        // If the page content exceeds max characters, it's broken up
        if (pageContent.length > maxChar) {
            const separateLines = pageContent
                .split(/\r?\n|\r|\n/g)
                .filter(line => (line.split(" ").length - 1) >= 3);
            combinedSummary = await getSummary(separateLines, maxChar);
        }

        // Else page content is summarized in one pass
        else {
            const summarizer = await ai.summarizer.create({
                sharedContext: `Only output in English.
                                Only output in trained language.
                                Use paragraph form.
                                Only summarize the content.`
            });
            combinedSummary = await summarizer.summarize(pageContent);
            summarizer.destroy();
        }
        loadingSpinner.style.display = 'none';

        // Populate summary portion of the sidebar
        summary.innerHTML = `<span>${combinedSummary.replace(/\*/g, '')}</span>`;
        chrome.runtime.sendMessage({ action: "activateAnalyzeButton" });
    } else {
        sidebar.style.display = 'block'; // Show the sidebar if it already exists
    }
}

// Function that fetches the web page content
async function getPageContent() {
    const mainContent = document.querySelector('article, main, section.content, div.article, div.post, div.entry');

    let contentText = '';

    if (mainContent) {
        // Get only paragraphs and headers within the main content area
        const contentElements = mainContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');

        contentElements.forEach(element => {
            const text = element.innerText.trim();
            if (text.length > 0) {
                contentText += text + '\n';
            }
        });
    } else {
        // Fallback to capture standard elements if no specific container is found
        const contentElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
        contentElements.forEach(element => {
            const text = element.innerText.trim();
            if (text.length > 0) {
                contentText += text + '\n';
            }
        });
    }

    return contentText;
}

// Function that breaks web content into sections for summarization.
// Then combines the summaries into one
async function getSummary(separateLines, maxChar) {
    let pageArray = [];
    let curEl = '';

    for (const line of separateLines) {
        if ((curEl + line).length < maxChar) {
            curEl += line + '\n';
        } else {
            const summarizer = await ai.summarizer.create({
                sharedContext: `Only output in English.
                                Only output in trained language.
                                Only summarize the content.
                                Use paragraph form.`
            });
            const summary = await summarizer.summarize(curEl.trim());
            summarizer.destroy();
            pageArray.push(summary);
            curEl = line + '\n';
        }
    }

    // Summarize and add any remaining content
    if (curEl.trim().length > 0) {
        const summarizer = await ai.summarizer.create({
            sharedContext: `Only output in English.
                            Only output in trained language.
                            Only summarize the content.
                            Use paragraph form.`
        });
        const summary = await summarizer.summarize(curEl.trim());
        summarizer.destroy();
        pageArray.push(summary);
    }

    // Combine all summaries and create a final summarization
    const combinedSummaryInput = pageArray.join('\n'); // Join all summaries
    const finalSummarizer = await ai.summarizer.create({
        sharedContext: `Combine everything in a paragraph.
                        Only output in English.
                        Only output in trained language.
                        Only summarize the content.
                        Use paragraph form.`
    });
    const combinedSummary = await finalSummarizer.summarize(combinedSummaryInput.trim());
    finalSummarizer.destroy();
    return combinedSummary;
}

// Function that populates the analysis portion of the sidebar
async function populateSidebar(pageData) {
    const htmlData = await analyzePageText(pageData);

    const analysisContent = document.getElementById('analysis');
    analysisContent.innerHTML = '';
    analysisContent.innerHTML = `<span>${htmlData}</span>`;

    chrome.runtime.sendMessage({ action: "turnOffLoadingCircle" });
}

// Function that analyzes web page content
async function analyzePageText(pageData) {
    try {
        const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
        if (available !== "no") {
            const summaryEl = document.getElementById('summary');
            const summary = summaryEl.textContent;
            const session = await ai.languageModel.create({
                systemPrompt: ` You will be given text to analyze with the given context: ${summary}

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
                            `
            });

            // Fetch result - Further lines format the result properly
            const result = await session.prompt(`Analyze: "${pageData}"`);

            htmlData = formatTextReponse(result);

            // Destroy session
            session.destroy();

            return htmlData;
        }
    } catch (error) {
        if (error.message === "Other generic failures occurred.") {
            return `Other generic failures occurred. Retrying...`;
        }
        console.error("Error generating content:", error);
        return error.message;
    }
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

    // Error message if the summary is empty
    if (summaryEl.innerText === "") {
        bubble.style.color = 'red';
        bubble.innerHTML = `
        <div class="bubble-title">Fact Checker</div>
        <div class="bubble-content">Wait until summary generation completes.</div>
        <footer class="bubble-footer">
            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>
        </footer>
        `;
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

    makeBubbleDraggable(bubble);

    let result = '';
    try {
        const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
        if (available !== "no") {
            const session = await ai.languageModel.create({
                systemPrompt: ` You will be given text to fact-check with the given context: ${summary}

                                Only use English.
                                Ignore text you're not trained on.
                                Don't output language you're not trained on.
                                Bold Titles.
                                Fact check the text and output in this exact format without including what's in parantheses:
                                    Fact Check Result: (True, Partially True, False, Unverified, Opinion)

                                    Explanation: (Give an explanation of the fact check)
                                
                                Again: Do NOT include what is in parantheses in the format.
                            `
            });

            // Fetch result - Further lines format the result properly
            result = await session.prompt(`Analyze: "${selectedText}"`);

            result = formatTextReponse(result);

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

    // Close bubble on click
    bubble.addEventListener("dblclick", () => bubble.remove());
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

// Function that formats response from model
function formatTextReponse(response) {
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