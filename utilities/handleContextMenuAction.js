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
        chrome.tabs.sendMessage(tab.id, { action, selectedText: info.selectionText });
    }
}