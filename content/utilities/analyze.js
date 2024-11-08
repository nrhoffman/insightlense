// Function that analyzes web page content
export async function generateAnalysis(pageData, retries = 10, delay = 1000) {
    let result = '';
    const summary = document.getElementById('summary').textContent;

    const session = await ai.languageModel.create({ systemPrompt: getAnalysisPrompt(summary) });

    let attempt = 0;

    while (attempt < retries) {
        try {
            result = await session.prompt(`Analyze: "${pageData}"`);
            break;
        } catch (error) {
            console.log(`Error analyzing content on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt < retries) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else {
                console.log("Max retries reached. Returning empty analysis.");
                result = "Analysis failed after multiple attempts.";
            }
        }
    }

    session.destroy();

    return result;
}

// Helper function to get the analysis prompt
function getAnalysisPrompt(summary) {
    return `You will be given text to analyze with the given context: ${summary}

            Only use English.
            Ignore text you're not trained on.
            Don't output language you're not trained on.
            Bold Titles.
            Analyze the text and output in this exact format without including what's in parantheses:
                1. Attributes:
                - Sentiment(e.g., Positive, Negative, Neutral): Explanation
                - Emotion(What emotion can be interpreted from the text): Explanation
                - Toxicity(e.g., High, Moderate, Low, None): Explanation
                - Truthfulness(e.g., High, Moderate, Low, Uncertain): Explanation
                - Bias(e.g., High, Moderate, Low, None): Explanation
                
                2. Logical Falacies: (Identify any logical fallacies present and provide a brief explanation for each)
                - [List of logical fallacies and explanations]
                
                3. Ulterior Motives: (Assess if there are any ulterior motives behind the text and explain)
                - [List of potential ulterior motives]

                4. Overall Analysis: (Provide an overall analysis of the text)
                - [Detailed analysis of the implications and context of the text]
            
            Again: Do NOT include what is in parantheses in the format.
        `;
}