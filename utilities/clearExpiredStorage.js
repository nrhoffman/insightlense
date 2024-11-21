/**
 * Periodically clears expired items from local storage.
 */
export async function clearExpiredStorage(removeScheduleMs) {
    const allData = await chrome.storage.local.get();
    const currentTime = Date.now();

    for (const key in allData) {
        const item = allData[key];

        if (Array.isArray(item)) {
            // If the value is an array, filter its elements based on timestamps
            const filteredArray = item.filter(
                element => element.timestamp && currentTime - element.timestamp <= removeScheduleMs
            );

            if (filteredArray.length !== item.length) {
                await chrome.storage.local.set({ [key]: filteredArray });
            }
        } else if (item && item.timestamp) {
            // If it's an object with a timestamp, check for expiry
            if (currentTime - item.timestamp > removeScheduleMs) {
                await chrome.storage.local.remove(key);
            }
        }
    }
}
