	usernames = {}
,	typers = {}
,	clients = {}
,	users = {};

var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	commands = require('./commands.js'),
	sanitize = require('validator').sanitize;

server.listen(1337);
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});



io.sockets.on('connection', function(socket) {

	if(socket.username == "" && socket.username == null) return false;

	// check username exists already
	if(usernames[socket.username] !== undefined) 
		socket.username = socket.username + "(1)";

	var hs = socket.handshake;

	users[socket.username] = socket.id;
	clients[socket.id] = socket;

	socket.on('sendchat', function(data) {
		if(data != "") {
			data = sanitize(data).xss();
			socket.username = sanitize(socket.username).xss();
			io.sockets.emit('updatechat', socket.username, data);
		}
	});

	socket.on('adduser', function(username) {
		if (typeof(username) !== 'undefined') {
			socket.username = username;
			usernames[username] = username;
			socket.emit('updatechat', 'SERVER', 'You have connected');
			io.sockets.emit('sendnotification', username + ' has connected', 'green');
			io.sockets.emit('updateusers', usernames, commands.admins);
		}
	});

	socket.on('disconnect', function() {
		if (typeof(socket.username) !== 'undefined') {

			delete usernames[socket.username];
			delete commands.admins[socket.username];
			delete typers[socket.username];

			delete clients[socket.id];
			delete users[socket.username];

			io.sockets.emit('updateTypers', typers);
			io.sockets.emit('updateusers', usernames, commands.admins);
			io.sockets.emit('sendnotification', socket.username + ' has disconnected', 'orange');
		}
	});

	socket.on('sendcommand', function(command) {

		if(command.indexOf(' ') > 0) {
			var cmd = command.substr(0, command.indexOf(' '));
		} else {
			var cmd = command;
		}

		console.log('Command: ' + cmd);
		cmd = cmd.substring(1, cmd.length);

		console.log('Command: ' + cmd);

		var data = command.substr(command.indexOf(' ')+1); // strip the command

		commands.execute(cmd, data, io, socket, usernames);

	});

	socket.on('isTyping', function(typing) {

		if(typing == true)
			typers[socket.username] = true;
		else
			delete typers[socket.username];
		
		io.sockets.emit('updateTypers', typers);
	});

});
