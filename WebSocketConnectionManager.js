
function WebSocketConnectionManager(newConnectionCallback) {
	this.connections = {};
	this.events = {
		addConnection: []
	};
	this.data = {};
	this.defaultNewConnectionData = {};

	if ( 'function' == typeof newConnectionCallback ) {
		this.events.addConnection.push(newConnectionCallback);
	}
	else if ( newConnectionCallback ) {
		this.defaultNewConnectionData = newConnectionCallback;
	}
}

var CM = WebSocketConnectionManager.prototype;

CM.add = function(C) {
	var id = String(Math.random()).substr(2);

	C.data = {};
	for ( var name in this.defaultNewConnectionData ) {
		var prop = this.defaultNewConnectionData[name];
		if ( 'function' == typeof prop ) {
			C.data[name] = (function(C, fn) {
				return function() {
					return fn.apply(C, arguments);
				};
			})(C, prop);
		}
		else {
			C.data[name] = prop;
		}
	}
	C.data.id = id;

	this.connections[id] = C;

	this.trigger('addConnection', {id: id});
};

CM.findByX = function(x, value, callback) {
	var matches = [], id, C;

	for ( id in this.connections ) {
		C = this.connections[id];
		if ( C.data[x] === value ) {
			matches.push(C);
			callback && callback(C, id, this.connections);
		}
	}

	return matches;
};

CM.findById = function(id) {
	return this.findByX('id', id)[0];
};

CM.remove = function(id) {
	return delete this.connections[id];
};

CM.allButX = function(x, value, callback) {
	var matches = [], id, C;

	for ( id in this.connections ) {
		C = this.connections[id];
		if ( C.data[x] !== value ) {
			matches.push(C);
			callback && callback(C, id, this.connections);
		}
	}

	return matches;
};

CM.allButId = function(id, callback) {
	return this.allButX('id', id, callback);
};

CM.trigger = function(type, e) {
	var self = this;

	if ( this.events[type] ) {
		this.events[type].forEach(function(callback) {
			callback.call(self, e);
		});
	}
};

CM.size = function() {
	return this.findByX().length;
};

module.exports = WebSocketConnectionManager;
