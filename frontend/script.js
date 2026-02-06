function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value.toLowerCase();

    if (message.trim() === "") return;

    addMessage(message, "user");

    let botReply = "";

    if (message.includes("food") || message.includes("hungry") || message.includes("ration")) {
        botReply = "🍚 Food assistance is available. Nearest relief centers are distributing meals.";
    } 
    else if (message.includes("room") || message.includes("shelter") || message.includes("stay")) {
        botReply = "🏠 Temporary shelters are available. Please share your location.";
    } 
    else if (message.includes("medicine") || message.includes("fever") || message.includes("injury")) {
        botReply = "💊 Medical help is on the way. Emergency health camps are active nearby.";
    } 
    else if (message.includes("flood") || message.includes("rain") || message.includes("cyclone")) {
        botReply = "⚠️ Stay safe. Disaster response teams are monitoring the situation.";
    } 
    else {
        botReply = "I'm here to help. Please describe your emergency clearly.";
    }

    setTimeout(() => {
        addMessage(botReply, "bot");
    }, 500);

    input.value = "";
}

function addMessage(text, sender) {
    const chatbox = document.getElementById("chatbox");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    messageDiv.innerText = text;
    chatbox.appendChild(messageDiv);
}
