/**
 * Creates or shows the sidebar by either displaying an existing sidebar element
 * or creating a new one. Adds an event listener to the close button to allow 
 * hiding the sidebar when clicked.
 */
export async function createSidebar() {
    let sidebar = document.getElementById('insightSidebar') || createSidebarElement();
    sidebar.style.display = 'block'; // Show the sidebar

    // Event listener for close button
    document.getElementById('closeSidebarBtn').addEventListener('click', () => {
        sidebar.style.display = 'none';
    });
}

/**
 * Retrieves an existing loading spinner element or creates a new one if it does not exist.
 * The spinner is appended directly before the given parent element in the DOM.
 * 
 * @param {HTMLElement} parent - The element before which the loading spinner will be placed.
 * @returns {HTMLElement} The loading spinner element.
 */
export function getOrCreateLoadingSpinner(parent) {
    let loadingSpinner = document.getElementById('loadingSpinner');
    if (!loadingSpinner) {
        loadingSpinner = document.createElement('div');
        loadingSpinner.id = 'loadingSpinner';
        loadingSpinner.classList.add('spinner');
        parent.parentElement.insertBefore(loadingSpinner, parent);
    }
    return loadingSpinner;
}

/**
 * Creates the sidebar element, which contains the UI structure for the sidebar,
 * including a close button, a summary section, and an analysis section.
 * The element is appended to the document body.
 * 
 * @returns {HTMLElement} The newly created sidebar element.
 */
function createSidebarElement() {
    const sidebar = document.createElement('div');
    sidebar.id = 'insightSidebar';
    sidebar.innerHTML = `
        <button id="closeSidebarBtn">✖️</button>
        <h3>Summary</h3>
        <p id="summary">Open the popup, optionally enter a focus, and click summarize.</p>
        <h3>Analysis</h3>
        <p id="analysis">Highlight text, right click, and "Analyze". First generating summary can sometimes be beneficial.</p>
    `;
    document.body.appendChild(sidebar);
    return sidebar;
}