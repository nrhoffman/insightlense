/**
 * Formats the ChatBot's text response into HTML.
 * 
 * @param {string} response - The raw response text.
 * @returns {string} - The formatted HTML string.
 */
export function formatTextResponse(response) {
    return response
        .replace(/## (.*?)(?=\n|$)/g, "") // Remove headers
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
        .replace(/^\s*\*\s+/gm, "• ") // Bullets
        .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italicize
        .replace(/\n/g, "<br>"); // Line breaks
}