// NOTE: Normally I would put each class in its own file, then bundle them together.

class ElementNotFoundError extends Error {};

class SocketService {
    constructor() {
        this.socket = io.connect('http://185.13.90.140:8081/');
        this.socket.on('connect', () => {
            this.socket.on('message',  (message) => {
                MessageRenderer.appendRemoteMessage(message);
            });
        });
    }

    sendMessage(message) {
        this.socket.emit('message', message);
    }
}

CHAT = {};
CHAT.socketService = new SocketService();

class Message {
    static _createNewMessage() {
        return document.createElement('div');
    }

    static _createMessageMessage(message) {
        const messageMessage = document.createElement('span');
        messageMessage.classList.add('chat__message__message');
        messageMessage.innerHTML = message.message;
        return messageMessage;
    }

    static _createMessageUser(message) {
        const messageUser = document.createElement('span');
        messageUser.classList.add('chat__message__user');
        messageUser.innerHTML = `${message.user}: `;
        return messageUser;
    }

    static createMyMessage(message) {
        const newMessage = Message._createNewMessage();

        newMessage.classList.add('chat__message--own')
        newMessage.appendChild(Message._createMessageMessage(message));

        return newMessage;
    }

    static createRemoteMessage(message) {
        const newMessage = Message._createNewMessage();

        newMessage.appendChild(Message._createMessageUser(message));
        newMessage.appendChild(Message._createMessageMessage(message));

        return newMessage;
    }
}

class MessageRenderer {
    static _appendMessage(messageElement) {
        const chatWindow = document.getElementById('chat__messages--messages'); // error handling!

        chatWindow.appendChild(messageElement);
    }

    static _scrollToBottom() {
        const chatWindow = document.getElementById('chat__messages--messages'); // error handling!

        chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.clientHeight;
    }

    static appendMyMessage(message) {
        MessageRenderer._appendMessage(Message.createMyMessage(message));
        MessageRenderer._scrollToBottom();
    }

    static appendRemoteMessage(message) {
        MessageRenderer._appendMessage(Message.createRemoteMessage(message));
        MessageRenderer._scrollToBottom();
    }
}

class MessageSender {
    static _getElementValueById (id) {
        const inputField = document.getElementById(id);
    
        if (!inputField) {
            throw new ElementNotFoundError(`Element not found with id: ${id}`);
            return null;
        }
        return inputField.value;
    }

    static sendMessage() {
        let user = MessageSender._getElementValueById('chat__inputs__user') || 'Guest';
        let message = MessageSender._getElementValueById('chat__inputs__message');
        let messageObj = {user, message};

        if (message) { // order lul
            MessageRenderer.appendMyMessage(messageObj);
            CHAT.socketService.sendMessage(messageObj);
            document.getElementById('chat__inputs__message').value = '';
        }
    }

    static sendMessageOnEnter(event) {
        if (event.keyCode == 13) {
            document.getElementById('chat__inputs__send').click();
            document.getElementById('chat__inputs__send').classList.add('chat__button--active');
            setTimeout(() => {
                document.getElementById('chat__inputs__send').classList.remove('chat__button--active');
            }, 100);
            MessageSender.sendMessage();
        }
    }
}
