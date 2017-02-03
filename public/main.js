var socket = io();
function up() {
	socket.emit('button', {direction: "up"});
}
