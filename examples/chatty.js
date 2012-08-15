var WebSocketServer = require('websocket').server,
	HTTPServer = require('http').Server,
	WebSocketConnectionManager = require('wsconnmgr'),
	util = require('util'),
	httpServer,
	wsServer,
	connection,
	connectionManager;

function inspect(ass) {
	return console.log('string' == typeof ass ? ass : util.inspect(ass));
}

/**
 * Init HTTP server for initial connection/request
 */

httpServer = new HTTPServer(function(request, response) {
	inspect('Received request for ' + request.url);

	response.writeHead(404);
	response.end();
});

httpServer.listen(8083, function() {
	var port = this._connectionKey.split(':')[2];
	inspect('Server is listening on port ' + port);
});

/**
 * Connection manager
 */

connectionManager = new WebSocketConnectionManager(function(e) {
	var id = e.id,
		data = this.connections[id].data;

	data.name = '';
inspect(data);
});

/**
 * Init WebSocket server to accept TCP connections
 */

wsServer = new WebSocketServer({
	httpServer: httpServer
});

wsServer.on('request', function(request) {

	/**
	 * Create new (personal) TCP connection for client
	 */

	// Create connection
	var connection = request.accept();

	// Add to stack
	connectionManager.add(connection);

	// Report back with ID
	connection.sendUTF('Welcome, Anonymous. Your ID: ' + connection.data.id);
	inspect('Connection accepted from "' + request.origin + '" (' + connection.data.id + ')');
inspect(connectionManager);

	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			inspect('Received message: ' + message.utf8Data);

			var client = connectionManager.findById(this.data.id),
				parts = message.utf8Data.split(' '),
				cmd = parts.shift(),
				data = parts.join(' ');

			switch ( cmd ) {
				case 'eval':
					eval(data);
					break;

				case 'debug':
					inspect(this);
					inspect(connectionManager.findByX().length + ' connections');
					break;

				case 'shout':
					var name = client.data.name || 'Anonymous';
					connectionManager.allButId(this.data.id, function(C, id) {
						C.connection.sendUTF(name + ' says: ' + data);
					});
					break;

				case 'name':
					if ( data ) {
						client.data.name = data;
						this.sendUTF('Alrighty then! Nice to meet you, ' + connectionManager.findById(this.data.id).data.name);
					}
					break;

				default:
					var name = client.data.name || 'Anonymous';
					this.sendUTF('Yeah, whatever, ' + name + '...');
			}
		}
	}); // WebsocketConnection onMessage

	connection.on('close', function(reasonCode, description) {
		inspect('Peer ' + this.remoteAddress + ' (' + this.data.id + ') disconnected: [' + reasonCode + '] ' + description);
		connectionManager.remove(this.data.id);
	});

}); // WebsocketServer onRequest
