define(function(require, exports, module){

	exports.load = function(parent){
		var template = $('<div class="ui-loading"><div class="content"><div class="circle"></div><div class="circle1"></div></div></div>'),
			mask = $('<div class="ui-mask"></div>');
		mask.appendTo($(document.body));
		template.appendTo($(document.body));
		if(parent){
			var p = typeof parent == 'string' ? $(parent) : parent;
			template.offset(p.offset());
			mask.css({width:p.width(), height: p.height()});
		}else{
			var doc = $(document);
			template.css({left: (doc.width()-200)/2, top:(doc.height()-50)/2});
			mask.css({width:doc.width(), height: doc.height()});
		}

		return {
			finish: function(){
				mask.fadeOut(500, function(){
					mask.remove();
					template.remove();
				})
			}
		}
	};	

});