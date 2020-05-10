const CHATBOT_ROUTE = "ws://localhost:3000/chatbot"
const IA_ROUTE = "ws://localhost:4000/ia"


// player input
const iaConnection = openIAWebSocket()
document.getElementById("player-input").onkeydown = detectPlayerInput;

function detectPlayerInput(event) {
    if (event.key === "Enter") { //si on appuie sur "Entrée"
        processCommand(this.value);
        sendMessage(iaConnection, this.value);
        this.value = ""; //vide le champ texte
    }
    ;
}


function openIAWebSocket() {
    const connection = new WebSocket(IA_ROUTE)
    connection.onerror = (error) => {
        console.log(error)
    }
    connection.onopen = () => {
        console.log('websocket connection IA opened successfully')
    }

    return connection
}





// question input
const chatbotConnection = openChatbotWebSocket()
document.getElementById("question-input").onkeydown = detectQuestionInput;

function detectQuestionInput(event) {
    if (event.key === "Enter") { //si on appuie sur "Entrée"
        sendMessage(chatbotConnection, this.value);
        this.value = ""; //vide le champ texte
    }
    ;
}

function handleChatbotResponse(event) {
    console.log("Received message: '" + event.data + "'");
    document.getElementById("chatbot-response").textContent = event.data;

}

function sendMessage(connection, message) {
    console.log("sending message \"" + message + "\"")
    connection.send(JSON.stringify({message: message}));
}

function openChatbotWebSocket() {
    const connection = new WebSocket(CHATBOT_ROUTE)
    connection.onerror = (error) => {
        console.log(error)
    }
    connection.onopen = () => {
        console.log('websocket connection chatbot opened successfully')
    }
    connection.onmessage = handleChatbotResponse
    return connection
}
