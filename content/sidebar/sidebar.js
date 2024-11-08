// Function that creates or shows the sidebar
export async function createSidebar() {
    let sidebar = document.getElementById('insightSidebar') || createSidebarElement();
    sidebar.style.display = 'block'; // Show the sidebar

    // Event listener for close button
    document.getElementById('closeSidebarBtn').addEventListener('click', () => {
        sidebar.style.display = 'none';
    });
}


// Helper function to get or create a loading spinner
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

// Helper function to create sidebar element
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