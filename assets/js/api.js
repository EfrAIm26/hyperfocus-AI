// assets/js/api.js
async function fetchChatCompletion(messages, model) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: model
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        return 'Lo siento, hubo un error al procesar tu solicitud.';
    }
}

export { fetchChatCompletion };