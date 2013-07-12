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
        },
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