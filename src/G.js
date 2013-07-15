
var G = (function(){

	var	g = {}, $,
	document = window.document, 
	classCache = {}, displayCache = {},
	class2type = {}, toString = class2type.toString,
	emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,

	fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]*)$/,
    tagSelectorRE = /^[\w-]+$/,
    filterRe = new RegExp('(.*):(\\w+)(?:\\(([^)]+)\\))?$\\s*'),
    childRe  = /^\s*>/,
    classTag = 'G' + (+new Date())

    methods = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
        'tr': document.createElement('tbody'),
        'tbody': table, 'thead': table, 'tfoot': table,
        'td': tableRow, 'th': tableRow,
        '*': document.createElement('div')
    };

    /**
     * @constructor
     * @param {string} selector - selector.
     * @param {object} context - context.
     */
    $ = function(selector, context){
        return g.init(selector, context);
    };
    $.uuid = 0;
    $.support = {};
    $.expr = {};

    function className(node, value){
        var klass = node.className, svg  = klass && klass.baseVal !== undefined
        if (value === undefined){ return svg ? klass.baseVal : klass; }
        svg ? (klass.baseVal = value) : (node.className = value)
    }
    function getCssProperty(ele, property){
        var style = window.getComputedStyle(ele, null) || ele.currentStyle;
        return style[property];
    }
    function setAttribute(node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
    }
    function camelize(str){
        return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' });
    }
    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg;
    }
    function defaultDisplay(nodeName) {
        var element, display;
        if (!displayCache[nodeName]) {
            element = document.createElement(nodeName);
            document.body.appendChild(element);
            display = getCssProperty(element, 'display');
            element.parentNode.removeChild(element);
            display == "none" && (display = "block");
            displayCache[nodeName] = display;
        }
        return displayCache[nodeName];
    }
    function deserialize(value) {
        try {
            if(value == 'true'){ return true;
            }else if(value == 'false'){ return false;
            }else if(!isNaN(value)){ return value-0;
            }else if(/^[\[\{]/.test(value)){  return $.parseJSON(value);
            }else{ return value; }
        } catch(e) {
            return value;
        }
    }

	function type(obj) {
    	return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
  	}
  	function isFunction(value) { return type(value) == "function";}
	function isWindow(obj)     { return obj != null && obj == obj.window;}
	function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE; }
	function isObject(obj)     { return type(obj) == "object";}
	function isPlainObject(obj) {
		return isObject(obj) && !isWindow(obj) && obj.__proto__ == Object.prototype;
	}
	function isArray(value) { return value instanceof Array;}
	function likeArray(value) { return typeof value.length == 'number';}
    
    function unique(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx; }); }
    function compact(array) { return filter.call(array, function(item){ return item != null }); }
    function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array; }

	function extend(target, source, deep) {
    	for (key in source){
      		if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        		if (isPlainObject(source[key]) && !isPlainObject(target[key])){
          			target[key] = {};
          		}
        		if (isArray(source[key]) && !isArray(target[key])){
	          		target[key] = [];
		        }
		        extend(target[key], source[key], deep);
		    } else if (source[key] !== undefined){
		    	target[key] = source[key];
		    }
	   	}
  	}
    
	function classRE(name) {
		return name in classCache ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
	}
	function children(element) {
    	return 'children' in element ? slice.call(element.children) :
      	$.map(element.childNodes, function(node){ if (node.nodeType == 1){ return node;}})
  	}
    function filtered(nodes, selector) {
        return selector === undefined ? $(nodes) : $(nodes).filter(selector);
    }

  	g.DOM = function(dom, selector) {
    	dom = dom || [];
    	dom.__proto__ = $.fn;
    	dom.selector = selector || '';
    	return dom;
  	};

  	g.isG = function(object) {
		return object instanceof g.DOM;
	};

	g.init = function(selector, context) {
    	if (!selector){
    		return g.DOM(); 
    	} else if (g.isG(selector)){
    		return selector;
    	} else {
      		var dom;
      		if (isArray(selector)){
      			dom = selector;
      		} else if (isObject(selector)) {
      			dom = [isPlainObject(selector) ? $.extend({}, selector) : selector], selector = null;
      		} else if (fragmentRE.test(selector)){
        		dom = g.fragment(selector.trim(), RegExp.$1, context), selector = null;
      		} else if (context !== undefined){
      			return $(context).find(selector);
      		} else {
      			dom = g.query(document, selector);
      		}
      	}
      	return g.DOM(dom, selector);
    };

	g.create = function(html, name, properties) {
    	if (html.replace){ html = html.replace(tagExpanderRE, "<$1></$2>");	}
    	if (name === undefined){ name = fragmentRE.test(html) && RegExp.$1;}
    	if (!(name in containers)){ name = '*';}

    	var nodes, dom, container = document.createElement('div');
    	container.innerHTML = '' + html;
	    dom = $.each(slice.call(container.childNodes), function(){
      		container.removeChild(this)
	    });
		if (isPlainObject(properties)) {
			nodes = $(dom);
			$.each(properties, function(key, value) {
				if (methods.indexOf(key) > -1){
					nodes[key](value);
				}else{
				    nodes.attr(key, value);
				}
			});
		}
    	return dom;
	};

    function visible(elem){
        elem = $(elem)
        return !!(elem.width() || elem.height()) && elem.css("display") !== "none"
    }

    var cssFilters = $.expr[':'] = {
        visible:  function(){ if (visible(this)) return this },
        hidden:   function(){ if (!visible(this)) return this },
        selected: function(){ if (this.selected) return this },
        checked:  function(){ if (this.checked) return this },
        parent:   function(){ return this.parentNode },
        first:    function(idx){ if (idx === 0) return this },
        last:     function(idx, nodes){ if (idx === nodes.length - 1) return this },
        eq:       function(idx, _, value){ if (idx === value) return this },
        contains: function(idx, _, text){ if ($(this).text().indexOf(text) > -1) return this },
        has:      function(idx, _, sel){ if (zepto.qsa(this, sel).length) return this }
    }

    function process(sel, fn) {
        // quote the hash in `a[href^=#]` expression
        sel = sel.replace(/=#\]/g, '="#"]')
        var cssfilter, arg, match = filterRe.exec(sel)
        if (match && match[2] in cssFilters) {
            cssfilter = cssFilters[match[2]], arg = match[3]
            sel = match[1]
            if (arg) {
                var num = Number(arg)
                if (isNaN(num)) arg = arg.replace(/^["']|["']$/g, '')
                else arg = num
            }
        }
        return fn(sel, filter, arg)
    }

    g._query = function(element, selector){
        var found
        return (isDocument(element) && idSelectorRE.test(selector)) ?
                ((found = element.getElementById(RegExp.$1)) ? [found] : [] ) :
                (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
                slice.call(
                    classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
                    tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
                    element.querySelectorAll(selector));
    };
    g.query = function(node, selector) {
        return process(selector, function(sel, filter, arg){
            try {
                var taggedParent
                if (!sel && filter) sel = '*'
                else if (childRe.test(sel))
                    // support "> *" child queries by tagging the parent node with a
                    // unique class and prepending that classname onto the selector
                    taggedParent = $(node).addClass(classTag), sel = '.'+classTag+' '+sel

                var nodes = g._query(node, sel)
            } catch(e) {
                console.error('error performing selector: %o', selector)
                throw e
            } finally {
                if (taggedParent) taggedParent.removeClass(classTag)
            }
            return !filter ? nodes : unique($.map(nodes, function(n, i){ return filter.call(n, i, nodes, arg) }))
        });
    }

    g._matches = function(element, selector) {
        if (!element || element.nodeType !== 1){ return false;}
        var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.matchesSelector ||
                            function (element, selector) {
                                var node = element, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
                                    while (nodes[++i] && nodes[i] != node);
                                    return !!nodes[i];
                            };
        if (matchesSelector){ return matchesSelector.call(element, selector);}
        var match, parent = element.parentNode, temp = !parent;
        if (temp){
            (parent = tempParent).appendChild(element)
        }
        match = g.query(parent, selector).indexOf(element);
        temp && tempParent.removeChild(element);
        return match;
    };
    g.matches = function(node, selector){
        return process(selector, function(sel, filter, arg){
            return (!sel || g._matches(node, sel)) &&
            (!filter || filter.call(node, null, arg) === node)
        })
    };



  	$.type = type;
  	$.isFunction = isFunction;
  	$.isWindow = isWindow;
  	$.isArray = isArray;
  	$.isPlainObject = isPlainObject;
  	$.isEmptyObject = function(obj) {
    	var name;
    	for (name in obj){
    		return false;
    	}
    	return true;
  	};
    if (window.JSON){
        $.parseJSON = JSON.parse;
    }
  	/**
  	 * extend
  	 */
  	$.extend = function(target){
    	var deep, args = slice.call(arguments, 1);
	    if (typeof target == 'boolean') {
	    	deep = target;
	      	target = args.shift();
	    }
    	args.forEach(function(arg){
    		extend(target, arg, deep);
    	});
    	return target;
  	};
  	/**
  	 * each
  	 */
  	$.each = function(elements, callback){
    	var i, key;
    	if(likeArray(elements)){
      		for (i = 0; i < elements.length; i++){
        		if (callback.call(elements[i], i, elements[i]) === false){ return elements;}
            }
		} else {
            for (key in elements){
                if (callback.call(elements[key], key, elements[key]) === false){ return elements;}
            }
        }
        return elements
    };
    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase();
    });
  	/**
  	 * contains
  	 */
  	$.contains = function(parent, node) {
    	return parent !== node && parent.contains(node);
	};
    $.query = g.query;
	/**
  	 * inArray
  	 */
	$.inArray = function(elem, array, i){
    	return emptyArray.indexOf.call(array, elem, i);
  	};
  	/**
  	 * trim
  	 */
  	$.trim = function(str) { return str.trim() };
  	$.map = function(elements, callback){
        var value, values = [], i, key;
        if (likeArray(elements)){
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i);
                if (value != null){ values.push(value);}
            }
        } else {
            for (key in elements) {
                value = callback(elements[key], key);
                if (value != null){ values.push(value);}
            }
        }
        return flatten(values);
    };
    $.grep = function(elements, callback){
        return filter.call(elements, callback);
    };

    $.fn = {
        forEach: emptyArray.forEach,
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        indexOf: emptyArray.indexOf,
        concat: emptyArray.concat,
        map: function(fn){
            return $($.map(this, function(el, i){ return fn.call(el, i, el); }));
        },
        slice: function(){
            return $(slice.apply(this, arguments))
        },
        ready: function(callback){
            if(readyRE.test(document.readyState)){
                callback($);
            }else{
                document.addEventListener('DOMContentLoaded', function(){ callback($);}, false);
            }
            return this;
        },
        get: function(idx){
            return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
        },
        toArray: function(){ return this.get(); },
        size: function(){
            return this.length;
        },
        remove: function(){
            return this.each(function(){
                if (this.parentNode != null){ this.parentNode.removeChild(this); }
            });
        },
        each: function(callback){
            emptyArray.every.call(this, function(el, idx){
                return callback.call(el, idx, el) !== false;
            });
            return this;
        },
        filter: function(selector){
            if (isFunction(selector)) return this.not(this.not(selector))
            return $(filter.call(this, function(element){
                return g.matches(element, selector);
            }));
        },
        add: function(selector, context){
            return $(unique(this.concat($(selector, context))));
        },
        is: function(selector){
            return this.length > 0 && g.matches(this[0], selector);
        },
        not: function(selector){
            var nodes=[];
            if (isFunction(selector) && selector.call !== undefined){
                this.each(function(idx){
                    if (!selector.call(this,idx)){
                        nodes.push(this);
                    }
                });
            }else {
                var excludes = typeof selector == 'string' ? this.filter(selector) : (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector);
                this.forEach(function(el){
                    if (excludes.indexOf(el) < 0){
                        nodes.push(el);
                    }
                });
            }
            return $(nodes);
        },
        has: function(selector){
            return this.filter(function(){
                return isObject(selector) ? $.contains(this, selector) : $(this).find(selector).size();
            });
        },
        eq: function(idx){
            return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1);
        },
        first: function(){
            var el = this[0];
            return el && !isObject(el) ? el : $(el);
        },
        last: function(){
            var el = this[this.length - 1]
            return el && !isObject(el) ? el : $(el)
        },
        find: function(selector){
            var result, $this = this
            if (typeof selector == 'object'){
                result = $(selector).filter(function(){
                    var node = this
                    return emptyArray.some.call($this, function(parent){
                        return $.contains(parent, node);
                    });
                });
            } else if (this.length == 1){
                result = $(g.query(this[0], selector));
            } else {
                result = this.map(function(){ return g.query(this, selector) });
            }
            return result;
        },
        closest: function(selector, context){
            var node = this[0], collection = false;
            if (typeof selector == 'object'){
                collection = $(selector);
            } 
            while (node && !(collection ? collection.indexOf(node) >= 0 : g.matches(node, selector))){
                node = node !== context && !isDocument(node) && node.parentNode
            }
            return $(node);
        },
        parents: function(selector){
            var ancestors = [], nodes = this;
            while (nodes.length > 0){
                nodes = $.map(nodes, function(node){
                    if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node);
                        return node;
                    }
                });
            }
            return filtered(ancestors, selector);
        },
        parent: function(selector){
            return filtered(unique(this.pluck('parentNode')), selector);
        },
        children: function(selector){
            return filtered(this.map(function(){ return children(this) }), selector)
        },
        contents: function() {
            return this.map(function() { return slice.call(this.childNodes) });
        },
        siblings: function(selector){
            return filtered(this.map(function(i, el){
                return filter.call(children(el.parentNode), function(child){ return child!==el })
            }), selector);
        },
        empty: function(){
            return this.each(function(){ this.innerHTML = '' })
        },
        pluck: function(property){
            return $.map(this, function(el){ return el[property] })
        },
        css: function(key, value){
            var me = this;
            if(key && value != undefined){
                me.each(me._elements, function(i, item){
                    item.style[key] = value;
                });
                return me;
            }else if(key){
                if(me._elements){
                    var ele = me._elements[0];
                    if(ele.currentStyle){
                        ele.currentStyle[key];
                    }else if(window.getComputedStyle){
                        return window.getComputedStyle(ele , null)[key];
                    }
                }
            }
        },
        hasClass: function(name){
            return emptyArray.some.call(this, function(el){
                return this.test(className(el));
            }, classRE(name));
        },
        addClass: function(name){
            return this.each(function(idx){
                classList = [];
                var cls = className(this), newName = funcArg(this, name, idx, cls);
                newName.split(/\s+/g).forEach(function(klass){
                    if (!$(this).hasClass(klass)){
                        classList.push(klass);
                    }
                }, this);
                classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "));
            });
        },
        removeClass: function(name){
            return this.each(function(idx){
                if (name === undefined){ return className(this, ''); }
                classList = className(this);
                funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
                  classList = classList.replace(classRE(klass), " ")
                })
                className(this, classList.trim())
            });
        },
        toggleClass: function(name, when){
            return this.each(function(idx){
                var $this = $(this), names = funcArg(this, name, idx, className(this));
                names.split(/\s+/g).forEach(function(klass){
                    (when === undefined ? !$this.hasClass(klass) : when) ? $this.addClass(klass) : $this.removeClass(klass);
                });
            });
        },
        show: function(){
            return this.each(function(){
                this.style.display == "none" && (this.style.display = null);
                if (this.css("display") == "none"){
                    this.style.display = defaultDisplay(this.nodeName);
                }
            });
        },
        replaceWith: function(newContent){
            return this.before(newContent).remove();
        },
        wrap: function(structure){
            var func = isFunction(structure);
            if (this[0] && !func){
                var dom = $(structure).get(0), clone = dom.parentNode || this.length > 1;
            }
            return this.each(function(index){
                $(this).wrapAll(func ? structure.call(this, index) : clone ? dom.cloneNode(true) : dom);
            });
        },
        wrapAll: function(structure){
            if (this[0]) {
                $(this[0]).before(structure = $(structure));
                var children;
                // drill down to the inmost element
                while ((children = structure.children()).length){
                    structure = children.first();
                }
                $(structure).append(this);
            }
            return this;
        },
        wrapInner: function(structure){
            var func = isFunction(structure);
            return this.each(function(index){
                var self = $(this), contents = self.contents(), dom  = func ? structure.call(this, index) : structure;
                contents.length ? contents.wrapAll(dom) : self.append(dom);
            });
        },
        unwrap: function(){
            this.parent().each(function(){
                $(this).replaceWith($(this).children());
            });
            return this;
        },
        clone: function(){
            return this.map(function(){ return this.cloneNode(true) });
        },
        hide: function(){
            return this.css("display", "none");
        },
        toggle: function(setting){
            return this.each(function(){
                var el = $(this);
                (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
            });
        },
        prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*'); },
        next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*'); },
        html: function(html){
            return html === undefined ? (this.length > 0 ? this[0].innerHTML : null) :
            this.each(function(idx){
                var originHtml = this.innerHTML;
                $(this).empty().append( funcArg(this, html, idx, originHtml) );
            });
        },
        text: function(text){
            return text === undefined ? (this.length > 0 ? this[0].textContent : null) :
            this.each(function(){ this.textContent = text });
        },
        attr: function(name, value){
            var result;
            return (typeof name == 'string' && value === undefined) ?
            (this.length == 0 || this[0].nodeType !== 1 ? undefined :
                (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
                (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
            ) :
            this.each(function(idx){
                if (this.nodeType !== 1){ return;}
                if (isObject(name)){
                    for (key in name){ setAttribute(this, key, name[key]);}
                } else {
                    setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
                }
            });
        },
        removeAttr: function(name){
            return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) });
        },
        prop: function(name, value){
            return (value === undefined) ? (this[0] && this[0][name]) : this.each(function(idx){
                this[name] = funcArg(this, value, idx, this[name]);
            });
        },
        data: function(name, value){
            var data = this.attr('data-' + dasherize(name), value);
            return data !== null ? deserialize(data) : undefined;
        },
        val: function(value){
            return (value === undefined) ?
            (this[0] && (this[0].multiple ?
               $(this[0]).find('option').filter(function(o){ return this.selected }).pluck('value') :
               this[0].value)
            ) :
            this.each(function(idx){
                this.value = funcArg(this, value, idx, this.value);
            });
        },
        offset: function(coordinates){
            if (coordinates){
                return this.each(function(index){
                    var $this = $(this),
                        coords = funcArg(this, coordinates, index, $this.offset()),
                        parentOffset = $this.offsetParent().offset(),
                        props = {
                            top:  coords.top  - parentOffset.top,
                            left: coords.left - parentOffset.left
                        };
                    if ($this.css('position') == 'static'){
                        props['position'] = 'relative';
                    }
                    $this.css(props);
                });
            }
            if (this.length==0){ return null;}
            var obj = this[0].getBoundingClientRect();
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            }
        },
        index: function(element){
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
        },
        scrollTop: function(){
          if (!this.length) return
          return ('scrollTop' in this[0]) ? this[0].scrollTop : this[0].scrollY;
        },
        position: function() {
            if (!this.length){ return; }

            var elem = this[0],
                // Get *real* offsetParent
                offsetParent = this.offsetParent(),
                // Get correct offsets
                offset       = this.offset(),
                parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
            offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

            // Add offsetParent borders
            parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
            parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

            // Subtract the two offsets
            return {
                top:  offset.top  - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        },
        offsetParent: function() {
            return this.map(function(){
                var parent = this.offsetParent || document.body;
                while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static"){
                    parent = parent.offsetParent;
                }
                return parent;
            })
        },
        width: function(value){
            var offset, el = this[0];
            if (value === undefined) return isWindow(el) ? el['innerWidth'] : isDocument(el) ? el.documentElement['offsetWidth'] : (offset = this.offset()) && offset['width']
            else return this.each(function(idx){
                el = $(this)
                el.css('width', funcArg(this, value, idx, el['width']()))
            })
        },
        height: function(value){
            var offset, el = this[0];
            if (value === undefined) return isWindow(el) ? el['innerHeight'] : isDocument(el) ? el.documentElement['offsetHeight'] : (offset = this.offset()) && offset['height']
            else return this.each(function(idx){
                el = $(this)
                el.css('height', funcArg(this, value, idx, el['height']()))
            })
        }
    };

    adjacencyOperators.forEach(function(operator, operatorIndex) {
        var inside = operatorIndex % 2 //=> prepend, append

        $.fn[operator] = function(){
            // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
            var argType, nodes = $.map(arguments, function(arg) {
                argType = type(arg)
                return argType == "object" || argType == "array" || arg == null ? arg : g.create(arg)
            }),
            parent, copyByClone = this.length > 1
            if (nodes.length < 1) return this

            return this.each(function(_, target){
                parent = inside ? target : target.parentNode
                // convert all methods to a "before" operation
                target = operatorIndex == 0 ? target.nextSibling : operatorIndex == 1 ? target.firstChild : operatorIndex == 2 ? target : null

                $.each(nodes, function(index, node){
                    if (copyByClone) node = node.cloneNode(true)
                    else if (!parent) return $(node).remove()

                    traverseNode(parent.insertBefore(node, target), function(el){
                        if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' && (!el.type || el.type === 'text/javascript') && !el.src)
                            window['eval'].call(window, el.innerHTML)
                    });
                })
            })
        };

        // after    => insertAfter
        // prepend  => prependTo
        // before   => insertBefore
        // append   => appendTo
        $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
            $(html)[operator](this)
            return this
        }

        function traverseNode(node, fun) {
            fun(node)
            for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
        }

    });

    return $;

})();


window.G = G;
'$' in window || (window.$ = G)