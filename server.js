#!/usr/bin/env node

// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
	console.log("CONNECT");

	socket.on('button', function (data) {
		console.log("BUTTON: " + data.direction);
	});

	socket.on('disconnect', function () {
		console.log("DISCONNECT");
	});
});
