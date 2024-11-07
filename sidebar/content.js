console.log("Content script loaded");
let modelInstance = null;
let pageContent = null;
let modelReady = false;
let summarizationReady = true;
let analysisReady = true;
let initializationReady = true;

// Listener for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    switch (request.action) {
        case "initializeModel":
            initializeModel();
        case "showSidebar":
            createSidebar();
            break;
        case 'summarizeContent':
            summarizeContent(request.focusInput);
            break;
        case 'analyzeContent':
            analyzeContent(request.pageData);
            break;
        case 'getChatBotOutput':
            getChatBotOutput(request.chatInput);
            break;
        case 'displayBubble':
            displayFactCheckBubble(request.selectedText);
            break;
        case 'getStatuses':
            sendResponse({
                modelStatus: modelReady ? "yes" : "no",
                summarizationStatus: summarizationReady ? "yes" : "no",
                analysisStatus: analysisReady ? "yes" : "no",
                initializationStatus: initializationReady ? "yes" : "no",
                summaryGenStatus: checkSummary() ? "yes" : "no"
            });
            break;
    }
});

// Function to initialize the model
async function initializeModel() {
    try {
        if (!modelInstance) {
            initializationReady = false;
            console.log("Initializing model...");

            // Request page content
            pageContent = await getPageContent();

            const maxChar = 3800;
            let result = null;

            // If page content exceeds maxChar, process it in chunks
            if (pageContent.length > maxChar) {
                let curEl = '';
                const separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(line => line.split(" ").length - 1 >= 3);

                for (const line of separateLines) {
                    if ((curEl + line).length < maxChar) {
                        curEl += line + '\n';
                    } else {
                        if (!modelInstance) {
                            modelInstance = await ai.languageModel.create({ systemPrompt: getPrompt(curEl) });
                        } else {
                            result = await initializeModelSection(curEl);
                        }
                        curEl = line + '\n';
                    }
                }

                // Process any remaining content
                if (curEl.trim().length > 0) {
                    result = await initializeModelSection(curEl);
                }
            } else {
                // Initialize the model directly with full content if within maxChar
                modelInstance = await ai.languageModel.create({ systemPrompt: getPrompt(pageContent) });
            }
            chrome.runtime.sendMessage({ action: "activateSendButton" });
            chrome.runtime.sendMessage({ action: "activateSummaryButton" });
            modelReady = true;
            initializationReady = true;
            console.log("Model Initialized...");
        } else { console.log("Using existing model..."); }
    } catch (error) {
        console.error("Error initializing model:", error);
    }
}

// Helper function that initializes model with another section
async function initializeModelSection(curEl, retries = 5, delay = 1000) {
    let result = '';
    let attempt = 0;

    while (attempt < retries) {
        try {
            result = await modelInstance.prompt(getPrompt(curEl));
            break;
        } catch (error) {
            console.log(`Error initializing content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay)); // Exponential backoff
                delay *= 2; // Increase delay for exponential backoff
            } else {
                console.log("Max retries reached. Returning empty result.");
                result = "Init failed after multiple attempts.";
            }
        }
    }

    return result;
}

function getPrompt(pageContent) {
    return `You are a chatbot that will answer questions about content given.
            Keep responses short.
            Remember enough to answer questions later: ${pageContent}`;
}

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
function checkSummary() {
    const summary = document.getElementById('summary');
    return summary.innerText !== "";
}

// Function fills the sidebar with a summary
async function summarizeContent(focusInput) {
    summarizationReady = false;
    const summary = document.getElementById('summary');
    summary.innerHTML = '';

    const loadingSpinner = getOrCreateLoadingSpinner(summary);

    const combinedSummary = await generateSummary(focusInput);
    loadingSpinner.remove();

    summary.innerHTML = `<span>${combinedSummary.replace(/\*/g, '')}</span>`;
    chrome.runtime.sendMessage({ action: "activateAnalyzeButton" });
    chrome.runtime.sendMessage({ action: "activateSummaryButton" });
    summarizationReady = true;
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
    let mainContent = document.querySelectorAll('article, main, section, div');
    const contentTemp = Array.from(mainContent)
        .filter(element => {
            // Exclude elements with classes typically associated with non-main content
            const className = element.className.toLowerCase();
            if (className === '') {
                return false;
            }
            const isSidebarOrNav = className.includes('sidebar') || className.includes('widget') ||
                className.includes('related') || className.includes('nav') ||
                className.includes('footer') || className.includes('advert') ||
                className.includes('recirc') || className.includes('ad');
            return !isSidebarOrNav
        });

    const contentElements = contentTemp.flatMap(element =>
        Array.from(element.querySelectorAll('p, a, h1, h2, h3, h4, h5, h6, li, blockquote, span, figcaption, em'))
            .filter(childElement => {
                // Check if the current element or its parent contains 'sidebar' or any other unwanted class
                const currentElementClass = childElement.className.toLowerCase();
                const parentElement = childElement.parentElement;
                const parentClass = parentElement ? parentElement.className.toLowerCase() : '';

                const isCurrentElementSidebar = currentElementClass.includes('sidebar') || currentElementClass.includes('widget') ||
                    currentElementClass.includes('related') || currentElementClass.includes('nav') ||
                    currentElementClass.includes('footer') || currentElementClass.includes('advert') ||
                    currentElementClass.includes('toolbar') || currentElementClass.includes('aside') ||
                    currentElementClass.includes('ad') || currentElementClass.includes('comment') ||
                    currentElementClass.includes('card') || currentElementClass.includes('episode') ||
                    currentElementClass.includes('tag') || currentElementClass.includes('recommend');

                const isParentSidebar = parentClass.includes('sidebar') || parentClass.includes('widget') ||
                    parentClass.includes('related') || parentClass.includes('nav') ||
                    parentClass.includes('footer') || parentClass.includes('advert') ||
                    parentClass.includes('toolbar') || parentClass.includes('aside') ||
                    parentClass.includes('ad') || parentClass.includes('comment') ||
                    parentClass.includes('card') || parentClass.includes('episode') ||
                    parentClass.includes('tag') || parentClass.includes('recommend');

                return !isCurrentElementSidebar && !isParentSidebar; // Exclude if either the current element or its parent is a sidebar or similar
            }));
    console.log(contentElements)
    const contentClean = Array.from(contentElements)
        .map(element => {
            let cleanedText = element.innerText.trim(); // Remove leading/trailing space
            cleanedText = cleanedText.replace(/\s+/g, ' ').replace(/\n+/g, ' ');
            return cleanedText.length > 0 ? cleanedText : '';
        })
        .filter(text => text.length > 0)
        .filter(text => text.split(/\s+/).length >= 5);
    const uniqueContent = Array.from(new Set(contentClean)).join('\n');
    console.log(uniqueContent);
    return uniqueContent;
}

// Function that passes page content to summarization model
async function generateSummary(focusInput) {
    const maxChar = 3800;
    if (pageContent.length > maxChar) {
        const separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(line => line.split(" ").length - 1 >= 3);
        return await summarizeLargePageContent(separateLines, maxChar, focusInput);
    } else {

        return await summarizePageContent(focusInput);
    }
}

// Helper function to summarize the page content in one pass
async function summarizePageContent(focusInput) {
    const summarizer = await ai.summarizer.create({ sharedContext: getSummaryContext(focusInput) });
    const summary = await summarizer.summarize(pageContent);
    summarizer.destroy();
    return summary;
}

// Function that breaks web content into sections for summarization
async function summarizeLargePageContent(separateLines, maxChar, focusInput) {
    let pageArray = [];
    let curEl = '';

    const summarizer = await ai.summarizer.create({ sharedContext: getSummaryContext(focusInput) });

    for (const line of separateLines) {
        if ((curEl + line).length < maxChar) {
            curEl += line + '\n';
        } else {
            console.log("current: ", curEl);
            const summary = await getSummary(summarizer, curEl);
            pageArray.push(summary);
            curEl = line + '\n';
        }
    }

    if (curEl.trim().length > 0) {
        console.log("last: ", curEl);
        const summary = await getSummary(summarizer, prompt);
        pageArray.push(summary);
    }

    const combinedSummaryInput = pageArray.join('\n');
    const combinedPrompt = `Figure out main topic and summarize into a paragraph: ${combinedSummaryInput.trim()}`;
    const combinedSummary = await getSummary(summarizer, combinedPrompt);
    summarizer.destroy();
    return combinedSummary;
}

// Function that generates the summary
async function getSummary(summarizer, prompt, retries = 5, delay = 1000) {
    let summary = '';
    let attempt = 0;

    while (attempt < retries) {
        try {
            summary = await summarizer.summarize(prompt);
            break;
        } catch (error) {
            console.log(`Error summarizing content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay)); // Exponential backoff
                delay *= 2; // Increase delay for exponential backoff
            } else {
                console.log("Max retries reached. Returning empty summary.");
                summary = "Summary failed after multiple attempts.";
            }
        }
    }

    return summary;
}

// Helper function to get shared context for summarization
function getSummaryContext(focusInput) {
    const domain = window.location.hostname;
    return `Domain content is coming from: ${domain}.
            Mention where the content is coming from using domain provided.
            Only output in English.
            Only output in trained format and language.
            Use paragraph form.
            Only summarize the content.
            Keep the summary short.
            Focus the summary on: "${focusInput}" if not blank.`;
}

// Function that populates the analysis portion of the sidebar
async function analyzeContent(pageData) {
    analysisReady = false;
    const analysisContent = document.getElementById('analysis');
    analysisContent.innerHTML = `<span>${await analyzePageText(pageData)}</span>`;
    chrome.runtime.sendMessage({ action: "turnOffLoadingCircle" });
    chrome.runtime.sendMessage({ action: "activateSummaryButton" });
    analysisReady = true;
}

// Function that analyzes web page content
async function analyzePageText(pageData, retries = 5, delay = 1000) {
    let result = '';
    const summary = document.getElementById('summary').textContent;

    const session = await ai.languageModel.create({ systemPrompt: getAnalysisPrompt(summary) });

    let attempt = 0;

    while (attempt < retries) {
        try {
            result = await session.prompt(`Analyze: "${pageData}"`);
            break;
        } catch (error) {
            console.log(`Error summarizing content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else {
                console.log("Max retries reached. Returning empty analysis.");
                result = "Analysis failed after multiple attempts.";
            }
        }
    }

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

// Function that gets
async function getChatBotOutput(input) {
    const result = await modelInstance.prompt(input);
    chrome.runtime.sendMessage({ action: "setChatBotOutput", output: result });
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

function displayErrorMessage(bubble) {
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