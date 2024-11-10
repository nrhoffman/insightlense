export async function generateRewrite(elements, summary, readingLevel) {
    const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
    if (available !== "no") {
        console.log("Creating");
        const rewriter = await ai.rewriter.create({
            //sharedContext: `Here's the context for the rewriting: "${summary}".`
        });
        console.log("Created");
        let index = 0;
        // Rewrite content for each valid element and replace the old content immediately
        for (const element of elements) {
            const rewrittenText = await rewriter.rewrite(element.textContent, {
                context: `Rewrite, without any bias or logical fallacies, at ${readingLevel}.`
            });
            console.log(index);
            index = index + 1;
            // Replace the original content with the rewritten text directly as it completes
            element.textContent = rewrittenText;
        }

        rewriter.destroy;
    }
    else{console.log("Model not ready");}
}