var username = ''
,	isTyping = false
,	socket = io
,	gotUsername = false;

$(function() {

	// gotUsername = (localStorage["username"] != "" && localStorage["username"] != null) ? true : false;
	gotUsername = (sessionStorage["username"] != "" && sessionStorage["username"] != null) ? true : false;
	
	// alert(gotUsername);
	// alert(localStorage["username"]);

	if(!gotUsername) {
		$('.modal-overlay').slideDown('fast');
		$('#setusername').on('click', connect);
	}
	else connect();

	$('#message').on('keyup', function(event) {

		var $this = $(this);
		var wasTyping = isTyping;

		isTyping = ($this.val() == "") ? false : true;

		if(event.which == 13) {
			var message = $('#message').val();
			$('#message').val();

			if(message.substring(0,1) == "#")
				socket.emit('sendcommand', message);
			else
				socket.emit('sendchat', message);

			$this.val('');
			isTyping = false;
		}

		if((wasTyping != true && isTyping == true) || isTyping == false)
			socket.emit('isTyping', isTyping);
	});

});


function connect() {

	if(!gotUsername) {
		username = $('#username').val();
		// localStorage["username"] = username;
		sessionStorage["username"] = username;
	} else {
		// username = localStorage["username"];
		username = sessionStorage["username"];
	}

	if(username == "") {
		alert('you need to enter a username');
		return false;
	}

	$('.modal-overlay').slideUp();
	$('#message').focus();

	socket = io.connect('http://' + window.location.hostname + ':1337');

	socket.on('connect', function() {
		socket.emit('adduser', username);
	});

	socket.on('updateTypers', function(typers) {
		var count = 0;
		$('#typers').empty();
		$.each(typers, function(key, value) {
			if(key != username) {
				$('#typers').append('<span style="margin-left:5px;"><img src="images/keyboard.png" />&nbsp;' + key + ' is typing... &nbsp;</span>');
				count++;
			}
		});

		if(count == 0) $('#typers').hide('fast');
		else 		   $('#typers').show('fast');
	});

	socket.on('updatechat', function(username, data) {
		$el = $('#convo-area');
		$el.append('<b>' + username + '</b>: ' + data + '<br />');
		$el.animate({ scrollTop: $el.prop("scrollHeight")}, 1000);
	});

	socket.on('sendnotification', function(data, color) {
		$('#convo-area').append('<span class="'+color+'">' + data + '</span><br />');
	});

	socket.on('updateusers', function(data, admins) {
		$('#users').empty();
		$.each(data, function(key, value) {
			if(admins[key] == true)	
				$('#users').append('<hr /><div class="orange">' + key + ' </div>');
			else
				$('#users').append('<hr /><div>' + key + '</div>');
		});
	});
}