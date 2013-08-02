define(function(require, exports, module){

	function Scroll(node){
		this.node = typeof node == 'string' ? $(node) : node; 
		this._init();
	}
	
	$.extend(Scroll.prototype, {
		_init: function(){
			var self = this;
			self.node.wrapInner('<div class="scl-content"></div>');
			self.node.wrapInner('<div class="contentArea clearfix"></div>');
			self.node.wrapInner('<div class="ui-scroll"></div>');

			self.render();
		},
		render: function(){
			var self = this;
			var STEP = 20, BAR_SIZE = 8;

			var scroll = self.node.find('.ui-scroll'),
				contentArea = self.node.find('.contentArea'),
				content = self.node.find('.scl-content'),
				trackV = $('<div class="trackV"><div class="track-bg"></div><div class="barV"></div></div>'),
				trackH = $('<div class="trackH"><div class="track-bg"></div><div class="barH"></div></div>');

			scroll.find('.trackV').remove();
			scroll.find('.trackH').remove();

			var w = self.node.width(), h = self.node.height(),
				ch = content.outerHeight(), cw = content.outerWidth();

			contentArea.height(ch>h?h:ch);

			w = self.node.width(), h = self.node.height();
			var sh = scroll.height(), sw = scroll.width(),
				scrollV, scrollH, barheight, barwidth;

			if(ch > sh){
				scroll.append(trackV);
				scroll.width(w);
				contentArea.width(w-BAR_SIZE);
				trackH.width(w-BAR_SIZE);
				scrollV = true;
			}
			if(cw > sw){
				scroll.append(trackH);
				scroll.height(h);
				contentArea.height(h-BAR_SIZE);
				trackV.height(h-BAR_SIZE);
				scrollH = true;
			}else{
				content.width(w);
			}

			var th = trackV.height(), tw = trackH.width();

			var moveFlagV = false, moveFlagH = false, move = {};
			if(scrollV){
				var barV = trackV.find('.barV'), barheight = h*h/ch;
				barheight < 20 ? barheight = 20 : null;
				barV.height(barheight);
				var max=h-barheight, perScroll = (ch-h)/max;
				//bind event
				barV.on('mousedown', function(e){
					if(e.button == 0){
						moveFlagV = true;
						move.top = e.pageY-barV.position().top;
						e.preventDefault();
						e.stopPropagation();
					}
					var process, cnt = self.node.find('.scl-content');
					$(document.body).on('mousemove', function(me){
						if(moveFlagV){
							if(!process){
								process = 1;
								var top = me.pageY-move.top;
								top < 0 ? top = 0 : null;
								top > max ? top = max : null;
								barV.css({top: top});
								cnt.css({'margin-top': -top*perScroll});
								setTimeout(function(){
									process = null;
								}, 100);
							}
						}
					});
					$(document.body).on('mouseup', function(){
						if(moveFlagV){
							moveFlagV = false;
							$(document.body).off('mousemove', '**');
						}
					});
				});
			}

			if(scrollH){
				var barH = trackH.find('.barH'), barwidth = w*w/cw;
				barwidth < 20 ? barwidth = 20 : null;
				barH.width(barwidth);
				var max=w-barwidth, perScroll = (cw-w)/max;
				//bind event
				barH.on('mousedown', function(e){
					if(e.button == 0){
						moveFlagH = true;
						move.left = e.pageX-barH.position().left;
						e.preventDefault();
						e.stopPropagation();
					}
					var process, cnt = self.node.find('.scl-content');
					$(document.body).on('mousemove', function(me){
						if(moveFlagH){
							if(!process){
								process = 1;
								var left = me.pageX-move.left;
								left < 0 ? left = 0 : null;
								left > max ? left = max : null;
								barH.css({left: left});
								cnt.css({'margin-left': -left*perScroll});
								setTimeout(function(){
									process = null;
								}, 100);
							}
						}
					});
					$(document.body).on('mouseup', function(){
						if(moveFlagH){
							moveFlagH = false;
							$(document.body).off('mousemove', '**');
						}
					});
				});
			}
		}
	});
	return Scroll;
});
