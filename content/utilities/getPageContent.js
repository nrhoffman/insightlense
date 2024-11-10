// Function that fetches the web page content by selecting relevant elements and processing them.
export async function getPageContent() {
    // Select common elements that might contain the main content of the page
    let mainElements = document.querySelectorAll('article, main, section, div');

    // Extract content from the selected main elements, filtering out non-relevant ones
    const mainTemp = await extractContentElements(mainElements);

    // Further filter the extracted elements to focus only on meaningful content
    const contentTemp = await filterContentElements(mainTemp);

    // Clean the content text by removing unnecessary spaces and line breaks
    const contentClean = await cleanContentText(contentTemp);

    // Remove any duplicate content and join the cleaned text into a single string
    const uniqueContent = Array.from(new Set(contentClean)).join('\n');
    return uniqueContent;
}

/**
 * Extracts relevant content elements from a list of main page elements.
 * Filters out elements likely to be advertisements, sidebars, or unrelated sections.
 *
 * @param {NodeList} mainElements - The list of elements (article, section, etc.) to process.
 * @returns {Array} A list of elements that contain relevant content.
 */
export async function extractContentElements(mainElements) {
    return Array.from(mainElements)
        .filter(element => {
            const className = element.className.toLowerCase();
            if (className === '') {
                return false;
            }

            const isSidebarOrNav = className.includes('sidebar') || className.includes('widget') ||
                className.includes('related') || className.includes('nav') ||
                className.includes('footer') || className.includes('advert') ||
                className.includes('recirc') || className.includes('ad');
            
            return !isSidebarOrNav; // Return only elements that are not part of sidebars or ads
        });
}

/**
 * Filters elements to include only relevant tags (like paragraphs, headings, etc.)
 * and excludes elements that are likely sidebars or irrelevant content.
 *
 * @param {Array} mainTemp - The array of elements to filter.
 * @returns {Array} A filtered list of elements that are likely part of the main content.
 */
export async function filterContentElements(mainTemp) {
    return mainTemp.flatMap(element =>
        Array.from(element.querySelectorAll('p, a, h1, h2, h3, h4, h5, h6, li, blockquote, span, figcaption, em'))
            .filter(childElement => {
                const currentElementClass = childElement.className.toLowerCase();
                const parentElement = childElement.parentElement;
                const parentClass = parentElement ? parentElement.className.toLowerCase() : '';

                const isCurrentElementSidebar = currentElementClass.includes('sidebar') || currentElementClass.includes('widget') ||
                    currentElementClass.includes('related') || currentElementClass.includes('nav') ||
                    currentElementClass.includes('footer') || currentElementClass.includes('advert') ||
                    currentElementClass.includes('toolbar') || currentElementClass.includes('aside') ||
                    currentElementClass.includes('ad') || currentElementClass.includes('comment') ||
                    currentElementClass.includes('card') || currentElementClass.includes('episode') ||
                    currentElementClass.includes('tag') || currentElementClass.includes('recommend');

                const isParentSidebar = parentClass.includes('sidebar') || parentClass.includes('widget') ||
                    parentClass.includes('related') || parentClass.includes('nav') ||
                    parentClass.includes('footer') || parentClass.includes('advert') ||
                    parentClass.includes('toolbar') || parentClass.includes('aside') ||
                    parentClass.includes('ad') || parentClass.includes('comment') ||
                    parentClass.includes('card') || parentClass.includes('episode') ||
                    parentClass.includes('tag') || parentClass.includes('recommend');

                return !isCurrentElementSidebar && !isParentSidebar;
            }));
}

/**
 * Cleans up the text content by removing excessive whitespace, newlines, and short texts.
 * Ensures that only meaningful, readable text is retained.
 *
 * @param {Array} contentTemp - The list of elements to clean.
 * @returns {Array} A list of cleaned text strings.
 */
async function cleanContentText(contentTemp) {
    return Array.from(contentTemp)
        .map(element => {
            // Get the text content of the element and trim leading/trailing spaces
            let cleanedText = element.innerText.trim(); 
            cleanedText = cleanedText.replace(/\s+/g, ' ') // Replace multiple spaces with a single space
                                     .replace(/\n+/g, ' '); // Replace multiple newlines with a single space
            return cleanedText.length > 0 ? cleanedText : ''; // Only keep non-empty text
        })
        .filter(text => text.length > 0) // Remove any empty strings
        .filter(text => text.split(/\s+/).length >= 5); // Ensure that the text is not too short (at least 5 words)
}
