/**
 * Creates or shows the sidebar by either displaying an existing sidebar element
 * or creating a new one. Adds an event listener to the close button to allow 
 * hiding the sidebar when clicked.
 */
export async function createSidebar() {
    let sidebar = document.getElementById('insightSidebar') || createSidebarElement();
    sidebar.style.display = 'block'; // Show the sidebar

    // Event listener for close button (remove after trigger to optimize)
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    closeSidebarBtn?.addEventListener('click', () => hideSidebar(sidebar), { once: true });
}

/**
 * Hides the sidebar by setting its display style to 'none'.
 *
 * @param {HTMLElement} sidebar - The sidebar element to hide.
 */
function hideSidebar(sidebar) {
    sidebar.style.display = 'none';
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
        loadingSpinner = createLoadingSpinner();
        const boxContainer = parent.closest('.box-container');
        if (boxContainer) {
            boxContainer.insertBefore(loadingSpinner, parent);
        }
    }
    return loadingSpinner;
}

/**
 * Creates the loading spinner element with the appropriate ID and class.
 * 
 * @returns {HTMLElement} The newly created loading spinner element.
 */
function createLoadingSpinner() {
    const loadingSpinner = document.createElement('div');
    loadingSpinner.id = 'loadingSpinner';
    loadingSpinner.classList.add('spinner');
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
    sidebar.className = 'insight-sidebar';
    sidebar.innerHTML = `
        <button id="closeSidebarBtn">✖️</button>
        <h3>Summary</h3>
        <div class="box-container">
            <p id="summary">Open the popup, optionally enter a focus, and click summarize.</p>
        </div>
        <h3>Analysis</h3>
        <div class="box-container" id="analysisContainer">
            <p id="analysis">Highlight text, right-click, and "Analyze". First generate summary.</p>
        </div>
    `;
    document.body.appendChild(sidebar);
    return sidebar;
}