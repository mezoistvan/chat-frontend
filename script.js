class ElementNotFoundError extends Error {};

window.CHAT = {};

CHAT.socket = io.connect('http://185.13.90.140:8081/');
CHAT.socket.on('connect', () => {
    CHAT.socket.on('message',  (message) => {
        CHAT.appendOthersMessage(message);
    });
});

CHAT.getElementValueById = (id) => {
    const inputField = document.getElementById(id);

    if (!inputField) {
        throw new ElementNotFoundError(`Element not found with id: ${id}`);
        return null;
    }
    return inputField.value;
};

CHAT.appendMessage = (message, isOwnMessage) => {
    console.log(message.user, message.message, isOwnMessage ? 'this is my message' : 'this is not my message');

    const chatWindow = document.getElementById('chat__messages'); // plural? singular? CONSTISTENCY! // error handling!
    const newMessage = document.createElement('div');
    newMessage.innerHTML = `${message.user}: ${message.message}`; // something better than innerHTML? XSS vulnerability?
    // add class based on isOwnMessage
    chatWindow.appendChild(newMessage);
};

CHAT.appendMyMessage = (message) => CHAT.appendMessage(message, true);
CHAT.appendOthersMessage = (message) => CHAT.appendMessage(message, false);

CHAT.sendChatMessage = () => {
    let user = CHAT.getElementValueById('chat__inputs__user') || 'Guest';
    let message = CHAT.getElementValueById('chat__inputs__message');
    let messageObj = {user, message};

    if (message) { // disable chat button?
        CHAT.socket.emit('message', messageObj);
        CHAT.appendMyMessage(messageObj);    
    }
};
