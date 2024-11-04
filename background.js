chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "factCheck",
        title: "Fact-Check",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "factCheck" && info.selectionText) {
        try {
            // Inject the content script
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["./sidebar/content.js"]
            });

            // Inject the CSS
            await chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ["./sidebar/content.css"]
            });

            // Send the message to display the fact-check bubble
            chrome.tabs.sendMessage(tab.id, { action: "displayBubble", selectedText: info.selectionText });

        } catch (error) {
            console.error("Error in context menu action:", error);
        }
    }
});