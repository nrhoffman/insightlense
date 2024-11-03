chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "factCheck",
        title: "Fact-Check",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "factCheck" && info.selectionText) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["./sidebar/content.js"]
        },
            () => {
                chrome.scripting.insertCSS({
                    target: { tabId: tab.id },
                    files: ["./sidebar/content.css"]
                },
                    () => {
                        chrome.tabs.sendMessage(tab.id, { action: "displayBubble", selectedText: info.selectionText });
                    });
            });
    }
});