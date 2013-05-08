var admins = {};

var commands = {

	login: function(data, io, socket, usernames) {

		if(data == 'pass') {
			admins[socket.username] = true;
			io.sockets.emit('sendnotification', socket.username + ' logged in as admin', 'blue');
		} else {
			clients[socket.id].emit('sendnotification', 'Login failed!', 'red');
		}
		
		io.sockets.emit('updateusers', usernames, admins);
	},

	logout: function(data, io, socket, usernames) {

		delete admins[socket.username];
		io.sockets.emit('sendnotification', socket.username + ' logged out of admin', 'blue');
		io.sockets.emit('updateusers', usernames, admins);
	}

};

function execute (cmd, data, io, socket, usernames) {

	if (typeof commands[cmd] !== 'function')
		clients[socket.id].emit('sendnotification', cmd + ' command not recognised', 'red');
	else
		commands[cmd](data, io, socket, usernames);
}

exports.execute = execute;
exports.admins = admins;