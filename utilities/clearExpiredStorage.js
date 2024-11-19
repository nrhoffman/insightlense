/**
 * Periodically clears expired items from local storage.
 */
export async function clearExpiredStorage(removeScheduleMs) {
    const allData = await chrome.storage.local.get();
    const currentTime = Date.now();

    for (const key in allData) {
        const item = allData[key];
        if (item.timestamp && currentTime - item.timestamp > removeScheduleMs) {
            await chrome.storage.local.remove(key);
        }
    }

    // Clean up expired messages in 'chatConversation'
    if (allData.chatConversation) {
        const recentMessages = allData.chatConversation.filter(
            msg => msg.timestamp && currentTime - msg.timestamp <= removeScheduleMs
        );
        if (recentMessages.length !== allData.chatConversation.length) {
            await chrome.storage.local.set({ chatConversation: recentMessages });
        }
    }
}