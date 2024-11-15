// Function that fetches the web page content by selecting relevant elements and processing them.
export async function getPageContent() {
    try {
        let mainElements = document.querySelectorAll('article, main, section, div, iframe');

        //In case of iframes
        mainElements = Array.from(mainElements).flatMap(element => {
            if (element.tagName.toLowerCase() === 'iframe') {
                try {
                    const iframeDoc = element.contentDocument || element.contentWindow.document;
                    return Array.from(iframeDoc.querySelectorAll('article, main, section, div'));
                } catch (error) {
                    console.warn("Skipping iframe due to possible security restrictions.");
                    return [];
                }
            }
            return element;
        })
        
        const mainTemp = await extractContentElements(mainElements);
        console.log(mainTemp);
        const contentFiltered = await filterContentElements(mainTemp);
        console.log(contentFiltered);
        const contentClean = await cleanContentText(contentFiltered);
        const uniqueContent = Array.from(new Set(contentClean));
        const stringContent = uniqueContent.join('\n');
        return stringContent;
    } catch (error) {
        console.error("Error fetching page content:", error);
        return ''; // Return an empty string if any error occurs
    }
}

/**
 * Extracts relevant content elements from a list of main page elements.
 * Filters out elements likely to be advertisements, sidebars, or unrelated sections.
 *
 * @param {NodeList} mainElements - The list of elements (article, section, etc.) to process.
 * @returns {Array} A list of elements that contain relevant content.
 */
async function extractContentElements(mainElements) {
    try {
        return Array.from(mainElements)
            .filter(element => {
                const className = element.className.toLowerCase();
                if (className === '') {
                    return false; // Skip empty className elements
                }

                // Check if the element is part of an unwanted section
                const isSidebarOrNav = className.includes('sidebar') || className.includes('widget') ||
                    className.includes('related') || className.includes('nav') ||
                    className.includes('footer') || className.includes('advert') ||
                    className.includes('recirc') || className.includes('ad') ||
                    className.includes('byline') || className.includes('card');

                return !isSidebarOrNav; // Return only elements that are not part of sidebars or ads
            });
    } catch (error) {
        console.error("Error extracting content elements:", error);
        return []; // Return an empty array if extraction fails
    }
}

/**
 * Filters elements to include only relevant tags (like paragraphs, headings, etc.)
 * and excludes elements that are likely sidebars or irrelevant content.
 *
 * @param {Array} mainTemp - The array of elements to filter.
 * @returns {Array} A filtered list of elements that are likely part of the main content.
 */
async function filterContentElements(mainTemp) {
    try {
        return mainTemp.flatMap(element =>
            Array.from(element.querySelectorAll('p, a, h1, h2, h3, h4, h5, h6, li, blockquote, span, figcaption, em'))
                .filter(childElement => {
                    const currentElementClass = childElement.className.toLowerCase();
                    const parentElement = childElement.parentElement;
                    const parentClass = parentElement ? parentElement.className.toLowerCase() : '';

                    // Filter out sidebar-like elements
                    const isSidebar = classIncludesAny(currentElementClass, parentClass);
                    return !isSidebar;
                }));
    } catch (error) {
        console.error("Error filtering content elements:", error);
        return []; // Return an empty array if filtering fails
    }
}

/**
 * Checks if a class name contains any of the unwanted keywords.
 * This is used for both child and parent elements.
 *
 * @param {string} currentClass - The class name of the current element.
 * @param {string} parentClass - The class name of the parent element.
 * @returns {boolean} - Returns true if any unwanted class is found.
 */
function classIncludesAny(currentClass, parentClass) {
    const unwantedClasses = [
        'sidebar', 'widget', 'related', 'nav', 'footer', 'advert', 'recirc', 'ad', 'toolbar', 'aside', 'comment',
        'card', 'episode', 'tag', 'recommend'
    ];
    return unwantedClasses.some(unwantedClass => currentClass.includes(unwantedClass) || parentClass.includes(unwantedClass));
}

/**
 * Cleans up the text content by removing excessive whitespace, newlines, and short texts.
 * Ensures that only meaningful, readable text is retained.
 *
 * @param {Array} contentTemp - The list of elements to clean.
 * @returns {Array} A list of cleaned text strings.
 */
async function cleanContentText(contentTemp) {
    try {
        return contentTemp
            .map(element => {
                // Get the text content of the element and trim leading/trailing spaces
                let cleanedText = element.innerText.trim(); 
                cleanedText = cleanedText.replace(/\s+/g, ' ') // Replace multiple spaces with a single space
                                         .replace(/\n+/g, ' '); // Replace multiple newlines with a single space
                return cleanedText.length > 0 ? cleanedText : ''; // Only keep non-empty text
            })
            .filter(text => text.length > 0) // Remove any empty strings
            .filter(text => text.split(/\s+/).length >= 5); // Ensure that the text is not too short (at least 5 words)
    } catch (error) {
        console.error("Error cleaning content text:", error);
        return []; // Return an empty array if cleaning fails
    }
}