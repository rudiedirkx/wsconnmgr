
# WebSocketConnectionManager: The Nodejs Module

WebSocketConnectionManager allows you to freely manage WebSocket
connections on a WebSocket server.

It probably works for all WebSocket modules, but in the Chatty
example I've used `websocket` (`npm install websocket`).

Chatty
----

The Chatty example is relatively simple: it only contains 1
connection manager on 1 server. You can init as many managers
as you want, to create games for example:

* 1 server/platform contains N games
* 1 game = 1 manager instance
* 1 manager instance contains 2 players (connections)

Actual example
----

```javascript
var WebSocketConnectionManager = require('wsconnmgr');
var connectionManager = new WebSocketConnectionManager();

// This is how `websocket` does it:
webSocketServer.on('request', function(request) {
	var connection = request.accept();

	// Add connection to manager
	connectionManager.add(connection);

	// Remove the connection when it's closed
	connection.on('close', function() {
		// `this.data.id` is added by WebSocketConnectionManager
		connectionManager.remove(this.data.id);
	});
});
```
