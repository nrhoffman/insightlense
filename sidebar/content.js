console.log("Content script loaded");

// Listener for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const tabId = request.tabId;

    // Displays the sidebar
    if (request.action === "showSidebar") {
        createSidebar(tabId);

        // Checks if summary exists and notifies the popup script
        const summary = document.getElementById('summary');
        if(summary.innerText!==""){
            chrome.runtime.sendMessage({ action: "activateAnalyzeButton" });
        }
    }
    
    // Populate the sidebar with analysis
    else if (request.action === 'populateSidebar') {
        populateSidebar(request.pageData);
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
            <p id="analysis"></p>
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
                sharedContext: `Only output in English. Leave out astrisks.`
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
    const contentElements = document.querySelectorAll('p');
    const sidebar = document.querySelector('#insightSidebar');
    let mainContent = '';

    contentElements.forEach((element) => {
        const text = element.innerText.trim();
        if (text.length > 0) {
            mainContent += text + '\n';
        }
    });

    if (sidebar) {
        mainContent = mainContent.replace(sidebar.innerText, '');
    }

    return mainContent.trim();
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
          sharedContext: `Only output in English. Leave out astrisks.`
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
        sharedContext: `Only output in English. Leave out astrisks.`
      });
      const summary = await summarizer.summarize(curEl.trim());
      summarizer.destroy();
      pageArray.push(summary);
    }
  
    // Combine all summaries and create a final summarization
    const combinedSummaryInput = pageArray.join('\n'); // Join all summaries
    const finalSummarizer = await ai.summarizer.create({
      sharedContext: `Combine everything in a paragraph. Only output in English. Leave out astrisks.`
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
async function analyzePageText(pageData){
    try{
        const {available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
        if (available !== "no") {
            const summaryEl = document.getElementById('summary');
            const summary = summaryEl.textContent;
            const session = await ai.languageModel.create({
                systemPrompt: ` You will be given text to analyze with the given context: ${summary}

                                Only use English.
                                Ignore text you're not trained on.
                                Don't output language you're not traiend on.
                                Bold Titles.
                                Analyze the text and output in this exact format without including what's in parantheses:
                                    1. Attributes:
                                    - Sentiment(e.g., Positive, Negative, Neutral): Explanation
                                    - Toxicity(e.g., High, Moderate, Low, None): Explanation
                                    - Truthfulness(e.g., High, Moderate, Low, Uncertain): Explanation
                                    - Bias(e.g., High, Moderate, Low, None): Explanation
                                    
                                    2. Logical Falacies: (Identify any logical fallacies present and provide a brief explanation for each)
                                    - [List of logical fallacies and explanations]
                                    
                                    3. Ulterior Motives: (Assess if there are any ulterior motives behind the text and explain)
                                    - [List of potential ulterior motives]

                                    4. Overall Analysis: (Provide an overall analysis of the text)
                                    - [Detailed analysis of the implications and context of the text]
                            `
            });

            // Fetch result - Further lines format the result properly
            const result = await session.prompt(`Analyze: "${pageData}"`);

            // Replace `##text` with ``
            let htmlData = result.replace(/## (.*?)(?=\n|$)/g, "");

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
    } catch (error) {
        if(error.message === "Other generic failures occurred.")
        {
            return `Other generic failures occurred. Retrying...`;
        }
        console.error("Error generating content:", error);
        return error.message;
    }
}
