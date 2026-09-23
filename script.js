document.addEventListener('DOMContentLoaded', () => {
    const txtPrompt = document.getElementById('prompt');
    const btnSend = document.getElementById('btnSend');
    const chatDiv = document.getElementById('chat');

    const messages = [];

    function showChat(){
        chatDiv.innerHTML = "";

        messages.forEach(({role, content}, index) => {
            const bubbleDiv = document.createElement('div');
            bubbleDiv.classList.add("bubble", role == "user" ? "bubble-user" : "bubble-assistant");
            bubbleDiv.textContent = content;
            /*if(role == 'user'){
                bubbleDiv.setAttribute('style', 'text-align: left;');
            }else{
                bubbleDiv.setAttribute('style', 'text-align: right;');
            }*/
            chatDiv.appendChild(bubbleDiv);
            /*if(((index+1)%2 == 0) && ((index+1) < (messages.length/2))){
                const bubbleHr = document.createElement('hr');
                bubbleHr.style.display = 'block';
                bubbleHr.style.visibility = 'visible';
                bubbleHr.style.opacity = '1';
                chatDiv.appendChild(bubbleHr);
            }*/
        });

        chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    btnSend.addEventListener('click', async () => {
        const text = txtPrompt.value.trim();

        if(!text) return;

        messages.push({
            role: 'user',
            content: text
        });

        txtPrompt.value = '';

        showChat();

        btnSend.disabled = true;

        const thinking = document.createElement('div');
        thinking.classList.add("bubble", "bubble-thinking");
        thinking.textContent = "Pensando...";
        chatDiv.appendChild(thinking);
        chatDiv.scrollTop = chatDiv.scrollHeight;

        try {
            const res = await fetch('http://localhost:11434/api/chat', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    model: "gemma4:e2b",
                    messages,
                    stream: false
                })
            });

            if(!res.ok){
                throw new Error("Error HTTP con Ollama");
            }

            const data = await res.json();

            const reply = data.message?.content ?? "(Sin respuesta)";

            messages.push({
                role: "assistant",
                content: reply
            });

            console.log(messages);
        } catch(err) {
            console.error(err);
            messages.push({
                role: "assistant",
                content: "Error al conectar con Ollama."
            });
        } finally {
            thinking.remove();
            showChat();
            btnSend.disabled = false;
        }
    });
});