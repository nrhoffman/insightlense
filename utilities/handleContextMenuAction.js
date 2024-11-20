/**
 * Handles the specific action based on the clicked context menu item.
 * 
 * @param {Object} info - Information about the clicked menu item and selection.
 * @param {Object} tab - Details of the active tab.
 */
export function handleContextMenuAction(info, tab) {
    const actions = {
        define: "displayDefineBubble",
        factCheck: "displayFactCheckBubble",
        analyze: "displayAnalysisBubble",
        rewrite: "displayRewriteBubble"
    };

    const action = actions[info.menuItemId];
    if (action && info.selectionText) {

        chrome.storage.local.get([`tab_${tab.id}`], async (result) => {
            const isEnabled = result[`tab_${tab.id}`] ?? false; // Default to "off"

            // Only proceed if the extension is enabled for this tab
            if (isEnabled) {
                chrome.tabs.sendMessage(tab.id, { action, selectedText: info.selectionText });
            } else {
                console.log("Extension is disabled for this tab.");
            }
        });
    }
}