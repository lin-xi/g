define(function(require, exports, module){
	function Event(){
		this._eventCache = {};

		this.on = function(eventType, callback){
			this._eventCache[eventType] = callback;
		};
		this.publish = function(eventType, data){
			if(this._eventCache[eventType]){
				var e={};
				e.type = eventType;
				e.data = data;
				this._eventCache[eventType](e);
			}
		};
		this.detach = function(eventType){
			delete this._eventCache[eventType];
		};
	}

	exports.extend = function(obj){
		Event.call(obj);
	}
});