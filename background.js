// Listener for Chrome extension installation event. Creates context menu options when the extension is installed.
chrome.runtime.onInstalled.addListener(() => {

    // Create a "Define" context menu item that appears when text is selected
    chrome.contextMenus.create({
        id: "define",
        title: "Define",
        contexts: ["selection"]
    });

    // Create a "Fact-Check" context menu item that appears when text is selected
    chrome.contextMenus.create({
        id: "factCheck",
        title: "Fact-Check",
        contexts: ["selection"]
    });

    // Create an "Analyze" context menu item that appears when text is selected
    chrome.contextMenus.create({
        id: "analyze",
        title: "Analyze",
        contexts: ["selection"]
    });
});

/**
 * Handles clicks on context menu items. Injects required scripts and styles, 
 * and then sends a message to content script based on the clicked menu item.
 * 
 * @param {Object} info - Information about the clicked context menu item, including selected text.
 * @param {Object} tab - Details of the active tab where the context menu was clicked.
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {

    // Inject the content script into the current tab
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["./dist/content.bundle.js"]
    });

    // Inject the CSS for styling the bubbles
    await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["./content/bubbles/bubbles.css"]
    });

    // Check if "Define" menu item was clicked and text is selected
    if (info.menuItemId === "define" && info.selectionText) {
        try {
            // Send message to display the define bubble with the selected text
            chrome.tabs.sendMessage(tab.id, { action: "displayDefineBubble", selectedText: info.selectionText });
        } catch (error) {
            console.error("Error in context menu action:", error);
        }
    }

    // Check if "Fact-Check" menu item was clicked and text is selected
    else if (info.menuItemId === "factCheck" && info.selectionText) {
        try {

            // Send message to display the fact-check bubble with the selected text
            chrome.tabs.sendMessage(tab.id, { action: "displayFactCheckBubble", selectedText: info.selectionText });
        } catch (error) {
            console.error("Error in context menu action:", error);
        }
    }

    // Check if "Analyze" menu item was clicked and text is selected
    else if (info.menuItemId === "analyze" && info.selectionText) {
        try {
            
            // Send message to display the analysis bubble with the selected text
            chrome.tabs.sendMessage(tab.id, { action: "displayAnalysisBubble", selectedText: info.selectionText });
        } catch (error) {
            console.error("Error in context menu action:", error);
        }
    }
});
