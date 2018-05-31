let socket = io.connect('http://185.13.90.140:8081/');
socket.on('connect', () => {
    socket.on('message',  (message) => {
        console.log(message);
    });
});
