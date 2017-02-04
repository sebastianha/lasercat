#!/usr/bin/env node

// Setup basic express server
var express = require('express');
var app = express();
var uuidV4 = require('uuid/v4');
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var server = require('https').createServer(credentials, app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

users = [];
currentUser = -1;
setInterval(function() {
	if(users[currentUser] !== undefined && users[currentUser].socket !== undefined) {
		users[currentUser].socket.emit("stop");
	}
	currentUser++;
	if(currentUser >= users.length) {
		currentUser = 0;
	}
	if(users[currentUser] === undefined) {
		currentUser = 0;
	}
	if(currentUser === 0 && users[0] === undefined) {
		return;
	}
	if(users[currentUser] !== undefined && users[currentUser].socket !== undefined) {
        io.emit("waitingTimeUpdate", {currentUser: currentUser, count: users.length, currentUuid: users[currentUser].uuid});
        users[currentUser].socket.emit("start", {currentUser: currentUser, userCount: users.length});
    }
	console.log(currentUser + ": " + users[currentUser].uuid)
}, 5000);

var handler;

function doMove(direction) {
    return function() {
        console.log("BUTTON: moving in direction: " + direction);
    }
}

io.on('connection', function (socket) {
	console.log("CONNECT");
	var uuid = uuidV4();
	users.push({socket: socket, uuid: uuid});

	socket.emit("connected", {uuid: uuid});
    io.emit("userCountChange", {currentUser: (users.lengt-1), count: users.length});
    console.log("current users: " + users.length);

	socket.on('button', function (data) {
		for(var u=0; u<users.length; u++) {
			if(users[u].uuid === uuid && u === currentUser) {
                if(data.action === "down") {
                    console.log("server triggered");
                    doMove(data.direction)();
                    handler = setInterval(doMove(data.direction), 500);
                } else if(data.action == "up") {
                    clearInterval(handler);
                }
				continue;
			}
		}
	});

	socket.on('disconnect', function () {
 		console.log("DISCONNECT");
		for(var u=0; u<users.length; u++) {
			if(users[u].uuid === uuid) {
				users.splice(u, 1);
				if(u <= currentUser) {
					currentUser--;
				}
				continue;
			}
		}
        console.log("current users: " + users.length);
        io.emit("userCountChange", {currentUser: null, count: users.length});
	});


});
