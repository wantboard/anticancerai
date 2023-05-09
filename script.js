document.addEventListener('DOMContentLoaded', () => {
    const nutrientSelect = document.getElementById('nutrient');
    const problemInput = document.getElementById('problem');
    const askButton = document.getElementById('ask-question');
    const responseContainer = document.getElementById('response-container');
    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    async function streamResponse(text, searchResults) {
        responseContainer.innerHTML = '';
        responseContainer.style.display = 'block';

        const listItemRegex = /^(-|\u{1F300}-\u{1F5FF}|\u{1F900}-\u{1F9FF}|\u{1F600}-\u{1F64F}|\d+\.)/u;

        const lines = text.split('\n');
        let currentSection = '';

        for (const line of lines) {
            if (listItemRegex.test(line)) {
                if (currentSection !== 'bullets') {
                    currentSection = 'bullets';
                    const bulletsList = document.createElement('ul');
                    responseContainer.appendChild(bulletsList);
                }
                const listItem = document.createElement('li');
                listItem.textContent = '';
                responseContainer.lastElementChild.appendChild(listItem);
                const content = line.replace(listItemRegex, '').trim();
                for (let i = 0; i < content.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 15));
                    listItem.textContent += content[i];
                }
            } else {
                if (currentSection !== 'text') {
                    currentSection = 'text';
                    const paragraph = document.createElement('p');
                    paragraph.textContent = '';
                    responseContainer.appendChild(paragraph);
                }
                for (let i = 0; i < line.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 15));
                    responseContainer.lastElementChild.textContent += line[i];
                }
            }
        }

        if (searchResults) {
            const searchResultsTitle = document.createElement('h3');
            searchResultsTitle.textContent = 'References:';
            responseContainer.appendChild(searchResultsTitle);

            const searchResultsList = document.createElement('ul');
            responseContainer.appendChild(searchResultsList);

            searchResults.forEach(result => {
                const searchResultItem = document.createElement('li');
                const searchResultLink = document.createElement('a');
                searchResultLink.href = `https://pubmed.ncbi.nlm.nih.gov/${result.metadata.pmid}/`;
                searchResultLink.textContent = `PMID: ${result.metadata.pmid}`;
                searchResultLink.target = '_blank';
                searchResultItem.appendChild(searchResultLink);
                searchResultsList.appendChild(searchResultItem);
            });
        }
    }

  

    async function askQuestion() {
        const nutrient = nutrientSelect.value;
        const problem = problemInput.value;

        const formattedProblem = problem.trim().endsWith('?') ? problem.trim() : problem.trim() + '?';

        const data = {
            values: {
                nutrient: `${nutrient}`
            },
            messages: [
                { role: "user", content: `Answer the following problem specifically as it relates to the nutrient ${nutrient}: ${formattedProblem}`},
            ],
        };

        // Display the spinner before making the API call
        responseContainer.innerHTML = '';
        responseContainer.style.display = 'block';
        responseContainer.appendChild(spinner);

        try {
            const response = await fetch('https://app.baseplate.ai/api/endpoints/2af21e09-6ba3-4bea-9372-c063bff8399d/completions', {
                method: 'POST',
                headers: {
                   
'Content-Type': 'application/json',
'Authorization': 'Bearer e77697a7-589d-418b-a52a-8b3c83007af7'
},
body: JSON.stringify(data)
});

              if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`API request failed: ${errorDetails}`);
        }

        const result = await response.json();

        // Remove the spinner before streaming the response
        responseContainer.innerHTML = '';

        if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
            streamResponse(result.choices[0].message.content.trim(), result.search_results);
        } else {
            throw new Error('Unexpected API response structure');
        }
    } catch (error) {
        // Remove the spinner in case of an error
        responseContainer.innerHTML = '';
        console.error('Error:', error.message);
        streamResponse('An error occurred. Please try again later.');
    }
}

askButton.addEventListener('click', askQuestion);
});