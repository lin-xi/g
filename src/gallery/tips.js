define(function(require, exports, module){

	function Tips(opt){
		var DEFAULT_CONFIG = {
			node: '',
			content: '',
			position: 'top',
			time: 2000
		};

		this.cfg = $.extend(DEFAULT_CONFIG, opt);
		this._init();
	}
	
	$.extend(Tips.prototype, {
		_init: function(){
			var self = this, cfg = self.cfg,
				uiTips = $('<div class="ui-tips"></div>'),
				img = $('<img src="images/hey.gif" height="90px" width="90px"/>'),
				content = $('<span class="tips-content"></span>'),
				triangle = $('<span class="triangle-'+cfg.position+'"></span>');

			uiTips.append(triangle);
			uiTips.append(content);
			content.append(img);
			content.append($('<span>').html(cfg.content));
			
			uiTips.appendTo($(document.body)).fadeIn();

			if(cfg.node != ''){
				var host = $(cfg.node),
					offset = host.offset(),
					w = host.outerWidth(),
					h = host.outerHeight(),
					tw = uiTips.outerWidth(),
					th = uiTips.outerHeight(),
					tleft, ttop;

				switch(cfg.position){
					case 'right':
						tleft = offset.left+w+20;
						ttop = offset.top+(h-th)/2;
					break;
					case 'left':
						tleft = offset.left-tw-20;
						ttop = offset.top+(h-th)/2;
					break;
					case 'bottom':
						tleft = offset.left+(w-tw)/2;
						ttop = offset.top+h+20;
					break;
					case 'top':
						tleft = offset.left+(w-tw)/2;
						ttop = offset.top-th-20;
					break;
				}
				uiTips.css({left: tleft, top: ttop});
			}else{
				var host = $(window),
					w = host.width(),
					h = host.height(),
					st = host.scrollTop(),
					tw = uiTips.outerWidth(),
					th = uiTips.outerHeight();
				console.log(h);
				console.log(st);
				console.log(th);
				uiTips.css({left: (w-tw)/2, top: (h-th)/2+st});
			}
			
			setTimeout(function(){
				uiTips.animate({opacity: 'hide'}, 'normal', 'swing', function(){
					uiTips.remove();
				});
			}, cfg.time);
		}
	});
	return Tips;
});
