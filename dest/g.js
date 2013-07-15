(function(undefined){
    //string trim
    if(!String.prototype.trim){
        String.prototype.trim = function(){ return this.replace(/^\s+|\s+$/g, '');}
    }
    //String substitute
    String.prototype.substitute = function(str, o, regexp){
		if (typeof str != 'string' || !o) { return str;}
        return str.replace(regexp || /\\?\{([^{}]+)\}/g, function (match, name) {
            if (match.charAt(0) === '\\') { return match.slice(1);}
            return (o[name] === undefined) ? EMPTY : o[name];
        });
	};

	// arrray indexOf
	if(!Array.prototype.indexOf){
		Array.prototype.indexOf = function (item) {
            for (var i = 0, len = this.length; i < len; ++i) {
                if (this[i] === item) {return i;}
            }
            return -1;
        }
	}
	// array lastIndexOf
	if(!Array.prototype.lastIndexOf){
		Array.prototype.lastIndexOf = function (item) {
	        for (var i = this.length - 1; i >= 0; i--) {
	            if (this[i] === item) { break;}
	        }
	        return i;
	    }
	}
	// array filter
	if(!Array.prototype.filter){
		Array.prototype.filter = function(fn, context){
        	var len = this.length, res = new Array();
        	for (var i = 0; i < len; i++){
                if (i in this && fn.call(context, this[i], i, this)){
                    res.push(val);
                }
            }
	        return res;
        };
	}
	// array map
	if(!Array.prototype.map){
		Array.prototype.map = function(fn, context){
			var len = this.length, res = new Array(len);
            for (var i = 0; i < len; i++) {
                res[i] = fn.call(context, this[i], i, this);
            }
            return res;
		};
	}
	// array reduce
	if(!Array.prototype.reduce){
		Array.prototype.reduce = function(fn, initialValue){
	    	var index = 0, length = this.length >>> 0, value, isValueSet = false;
	    	if (initialValue) {
	      		value = initialValue;
	      		isValueSet = true;
	    	}
		    for ( ; length > index; ++index) {
		    	if (index in this && isValueSet) {
		        	value = fn(value, this[index], index, this);
		      	} else {
		        	value = this[index];
		        	isValueSet = true;
		      	}
		    }
	    	return value;
		};
	}
	// array some
	if(!Array.prototype.some){
		Array.prototype.some = function(fn, context){
			var len = this.length;
            for (var i = 0; i < len; i++) {
                if (i in arr && fn.call(context, arr[i], i, arr)) {
                    return true;
                }
            }
            return false;
		};
	}
	// array every
	if(!Array.prototype.every){
  		Array.prototype.every = function(fn, context){
    		var len = this.length >>> 0;
	    	for (var i = 0; i < len; i++){
	      		if (i in this && !fun.call(context, this[i], i, this)){
	      			return false;
	      		}
	    	}
	    	return true;
  		};
	}
	//array forEach
	if (!Array.prototype.forEach ) {
  		Array.prototype.forEach = function(fn, context) {
    		for(var i = 0, len = this.length; i < len; ++i) {
      			if (i in this) {
        			fn.call(context, this[i], i, this);
     			}
    		}
  		};
	}
	// array unique
	Array.prototype.unique = function(){
		return this.filter.call(this, function(item, idx){ return this.indexOf(item) == idx });
	}

    //Function before
    Function.prototype.before = function(func){
        var me = this;
        return function(){
            if(func.apply(this, arguments) === false){
                return false;
            }
            return me.apply(this, arguments);
        }
    };
    //Function before
    Function.prototype.after = function(func){
        var me = this;
        return function(){
            var ret = me.apply(this, arguments);
            if(ret === false){
                return false;
            }
            func.apply(this, arguments);
            return ret;
        }
    };

    

})();
    // Class
    // -----------------
    // Thanks to:
    // - http://mootools.net/docs/core/Class/Class
    // - http://ejohn.org/blog/simple-javascript-inheritance/
    // - https://github.com/ded/klass
    // - http://documentcloud.github.com/backbone/#Model-extend
    // - https://github.com/joyent/node/blob/master/lib/util.js
    // - https://github.com/kissyteam/kissy/blob/master/src/seed/src/kissy.js

    // The base Class implementation.

var Class = (function(){

    function Class(o) {
        // Convert existed function to Class.
        if (!(this instanceof Class) && isFunction(o)) {
            return classify(o)
        }
    }

    function classify(cls) {
        cls.extend = Class.extend
        cls.implement = implement
        return cls
    }

    function implement(properties) {
        var key, value

        for (key in properties) {
            value = properties[key]

            if (Class.Mutators.hasOwnProperty(key)) {
                Class.Mutators[key].call(this, value)
            } else {
                this.prototype[key] = value
            }
        }
    }

    Class.create = function(parent, properties) {
        if (!isFunction(parent)) {
            properties = parent
            parent = null
        }

        properties || (properties = {})
        parent || (parent = properties.Extends || Class)
        properties.Extends = parent

        // The created class constructor
        function SubClass() {
            // Call the parent constructor.
            parent.apply(this, arguments)

            // Only call initialize in self constructor.
            if (this.constructor === SubClass && this.initialize) {
                this.initialize.apply(this, arguments)
            }
        }

        // Inherit class (static) properties from parent.
        if (parent !== Class) {
            mix(SubClass, parent, parent.StaticsWhiteList)
        }

        // Add instance properties to the subclass.
        implement.call(SubClass, properties)

        // Make subclass extendable.
        return classify(SubClass)
    }


    Class.extend = function(properties) {
        properties || (properties = {})
        properties.Extends = this

        return Class.create(properties)
    }

    // Mutators define special properties.
    Class.Mutators = {

        'Extends': function(parent) {
            var existed = this.prototype
            var proto = createProto(parent.prototype)

            // Keep existed properties.
            mix(proto, existed)

            // Enforce the constructor to be what we expect.
            proto.constructor = this

            // Set the prototype chain to inherit from `parent`.
            this.prototype = proto

            // Set a convenience property in case the parent's prototype is
            // needed later.
            this.superclass = parent.prototype
        },

        'Implements': function(items) {
            isArray(items) || (items = [items])
            var proto = this.prototype, item

            while (item = items.shift()) {
                mix(proto, item.prototype || item)
            }
        },

        'Statics': function(staticProperties) {
            mix(this, staticProperties)
        }
    }

    // Shared empty constructor function to aid in prototype-chain creation.
    function Ctor() {
    }

    // See: http://jsperf.com/object-create-vs-new-ctor
    var createProto = Object.__proto__ ?
        function(proto) {
            return { __proto__: proto }
        } :
        function(proto) {
            Ctor.prototype = proto
            return new Ctor()
        }


    // Helpers
    function mix(r, s, wl) {
        // Copy "all" properties including inherited ones.
        for (var p in s) {
            if (s.hasOwnProperty(p)) {
                if (wl && indexOf(wl, p) === -1) continue
                // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
                if (p !== 'prototype') {
                    r[p] = s[p]
                }
            }
        }
    }

    var toString = Object.prototype.toString

    var isArray = Array.isArray || function(val) {
        return toString.call(val) === '[object Array]'
    }

    var isFunction = function(val) {
        return toString.call(val) === '[object Function]'
    }

    var indexOf = Array.prototype.indexOf

    return Class;

})();