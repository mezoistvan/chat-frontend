'use strict';

// NOTE: Normally I would put each class in its own file, then bundle them together.
// Private functions start with an underscore.

/**
 * Static class that creates a chat message HTMLElement
 */
class Message {
    static _createNewMessage() {
        return document.createElement('div');
    }

    static _createMessageBody(message) {
        const messageBody = document.createElement('span');
        messageBody.classList.add('typography-normal');
        messageBody.textContent = message.message;
        return messageBody;
    }

    static _createMessageUser(message) {
        const messageUser = document.createElement('span');
        messageUser.classList.add('typography-bold');
        messageUser.textContent = `${message.user}: `;
        return messageUser;
    }

    /**
    * Returns a chat message where the user is not present and the content is aligned right
    */
    static createMyMessage(message) {
        const newMessage = Message._createNewMessage();

        newMessage.classList.add('chat__message--own')
        newMessage.appendChild(Message._createMessageBody(message));

        return newMessage;
    }

    /**
    * Returns a standard chat message with the user and message body
    */
    static createRemoteMessage(message) {
        const newMessage = Message._createNewMessage();

        newMessage.appendChild(Message._createMessageUser(message));
        newMessage.appendChild(Message._createMessageBody(message));

        return newMessage;
    }
}

/**
* Service class that handles the socket.io connection. It connects to the server when instantiated.
*/
class SocketService {
    constructor(messageRenderer) {
        this.messageRenderer = messageRenderer;

        this.socket = io.connect('http://185.13.90.140:8081/');
        this.socket.on('connect', () => {
            this.socket.on('message',  (message) => {
                this.messageRenderer.appendRemoteMessage(message);
            });
        });
    }

    /**
    * Send a socket message to the server
    */
    sendMessage(message) {
        this.socket.emit('message', message);
    }
}

class ElementNotFoundError extends Error {};

/**
* This class handles the element selection for the chat form. Currently only works if there is exactly one chat form in the DOM.
* Throws ElementNotFoundError if any chat element is not found.
*/
class ChatForm {
    _getFirstElementByClassName(className) {
        let potentialElement = document.getElementsByClassName(className)[0];
        if (!potentialElement) {
            throw new ElementNotFoundError(`Element not found with class name: ${className}`);
        }
        return potentialElement;
    }

    constructor() {
        this.userInput = this._getFirstElementByClassName('chat__inputs__user');
        this.messageInput = this._getFirstElementByClassName('chat__inputs__message');
        this.sendButton = this._getFirstElementByClassName('chat__inputs__send');
        this.messagesDisplay = this._getFirstElementByClassName('chat__messages--messages');
    }
}

/**
* Handles rendering of the messages in the chat form.
*/
class MessageRenderer {
    constructor(chatForm) {
        this.chatForm = chatForm;
    }

    _appendMessage(messageElement) {
        this.chatForm.messagesDisplay.appendChild(messageElement);
    }

    /**
    * After each message is added, the chat window has to be scrolled to the bottom manually.
    */
    _scrollToBottom() {
        this.chatForm.messagesDisplay.scrollTop = this.chatForm.messagesDisplay.scrollHeight - this.chatForm.messagesDisplay.clientHeight;
    }

    appendMyMessage(message) {
        this._appendMessage(Message.createMyMessage(message));
        this._scrollToBottom();
    }

    appendRemoteMessage(message) {
        this._appendMessage(Message.createRemoteMessage(message));
        this._scrollToBottom();
    }
}

/**
* Handles sending of the messages in the chat form.
*/
class MessageSender {
    constructor(socketService, chatForm, messageRenderer) {
        this.socketService = socketService;
        this.chatForm = chatForm;
        this.messageRenderer = messageRenderer;
    }

    /**
    * Sends the message via the socketService and resets the form's value if there is a message present
    */
    sendMessage() {
        let message = this.chatForm.messageInput.value;
        if (message) {
            let user = this.chatForm.userInput.value || 'Guest';
            let messageObj = {user, message};

            this.messageRenderer.appendMyMessage(messageObj);
            this.socketService.sendMessage(messageObj);
            this.chatForm.messageInput.value = '';
        }
    }

    /**
    * Sends the message on pressing the enter key in the message input
    */
    sendMessageOnEnter(event) {
        if (event.keyCode == 13) {
            this.chatForm.sendButton.click();
            this.chatForm.sendButton.classList.add('chat__button--active');
            setTimeout(() => {
                this.chatForm.sendButton.classList.remove('chat__button--active');
            }, 100);
            this.sendMessage();
        }
    }
}

/**
* The application uses the CHAT namespace on window.
*/
window.CHAT = {};
CHAT.chatForm = new ChatForm();
CHAT.messageRenderer = new MessageRenderer(CHAT.chatForm);
CHAT.socketService = new SocketService(CHAT.messageRenderer);
CHAT.messageSender = new MessageSender(CHAT.socketService, CHAT.chatForm, CHAT.messageRenderer);
