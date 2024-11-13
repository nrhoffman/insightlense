export async function generateRewrite(elements, summary, readingLevel) {
    const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
    if (available !== "no") {
        const rewriter = await ai.languageModel.create({ systemPrompt: `You are going to rewrite text removing bias, logical fallacies, and toxicity.
                                                                                Write at ${readingLevel}.
                                                                                Output nothing else but the  rewritten content.
                                                                                This is the context: ${summary}` });
        let index = 0;
        console.log(elements);
        // Rewrite content for each valid element and replace the old content immediately
        for (const element of elements) {
            const rewrittenText = await rewriter.prompt(element.textContent)
            console.log(index);
            index = index + 1;
            // Replace the original content with the rewritten text directly as it completes
            element.textContent = rewrittenText;
        }

        rewriter.destroy;
    }
    else{console.log("Model not ready");}
}