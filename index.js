var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = {};
var sockets = {};

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
	
	socket.on('join', function(user) {
		console.log("[join] " + JSON.stringify(user));

		if( clients[user.id] == undefined ) {

			user.socket_id = socket.id;
			clients[user.id] = user;
			sockets[socket.id] = {"uid":user.id, "socket":socket};

			io.sockets.emit('join', user);
		}
		else {
			if(clients[user.id].socket_id == socket.id ) {
			}
			else {
				socket.emit('error message', "Already used.");
			}
		}
	});

	socket.on('get users', function(user) {
		console.log("[get users] " + JSON.stringify(user));

		socket.emit("get users", clients);
	});

	socket.on('send message', function(msg){

		console.log("[send message]");
		console.log(msg);

		if( msg.receiver == "@TOALL" ) 
			io.sockets.emit('send message', msg);
		else {
			sockets[clients[msg.receiver.id].socket_id].socket.emit("send message", msg);
		}
	});

	socket.on('quit', function(msg) {

		console.log("[quit]" + msg);
		quit(socket.id);
	});

	socket.on('disconnect', function(msg) {

		console.log("[disconnect]" + msg);
		quit(socket.id);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

function quit( socket_id ) {

	try{
		var uid = sockets[socket_id].uid;
		
		io.sockets.emit('quit', clients[uid]);

		delete sockets[socket_id];
		delete clients[uid];

	} catch( e ) {
		console.log(e);
	}
}