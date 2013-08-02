define(function(require, exports, module){

	function Dialog(opt){
	}
	
	Dialog.confirm = function(node, cont, func){

		var	node = typeof node == 'object' ? node : $(node),
			uiDialog = $('<div class="ui-dialog"></div>'),
			img = $('<img src="images/hey.gif" height="90px" width="90px"/>'),
			content = $('<span class="tips-content"></span>'),
			btnArea = $('<div class="btnArea"><a class="ok-btn" data-icon="&#xe324;"></a><a class="cancel-btn" data-icon="&#xe326;"></a>'),
			triangle = $('<span class="triangle4"></span>');

		uiDialog.append(triangle);
		uiDialog.append(content);
		content.append(img);
		content.append($('<span>').html(cont));
		content.append(btnArea);
		uiDialog.appendTo($(document.body)).fadeIn();

		var host = node,
			offset = host.offset(),
			w = host.outerWidth(),
			h = host.outerHeight(),
			tw = uiDialog.outerWidth(),
			th = uiDialog.outerHeight(),
			tleft, ttop;
		tleft = offset.left+(w-tw)/2;
		ttop = offset.top-th-20;
		uiDialog.css({left: tleft, top: ttop});
		
		btnArea.find('.ok-btn').on('click', function(){
			func();
			uiDialog.fadeOut(1000, function(){
				uiDialog.remove();
			});
		});
		btnArea.find('.cancel-btn').on('click', function(){
			uiDialog.fadeOut(1000, function(){
				uiDialog.remove();
			});
		});
	};

	Dialog.box = function(content, maskNode, func){
		var	node = typeof node == 'object' ? node : $(node),
			uiDialog = $('<div class="ui-dialog"></div>'),
			contentArea = $('<div class="box-content"></div>'),
			titleArea = $('<div class="titleArea"><a class="ok-btn" data-icon="&#xe324;"></a><a class="cancel-btn" data-icon="&#xe326;"></a></div>');
			mask = $('<div class="ui-mask"></div>');

		$(document.body).append(mask);
		uiDialog.append(titleArea);
		typeof content == 'string'? contentArea.html(content) : contentArea.append(content);
		uiDialog.append(contentArea);
		uiDialog.appendTo($(document.body)).fadeIn();
		maskNode = maskNode || $(document.body);
		var host = $.type(maskNode || document.body) == 'string' ? $(maskNode) : maskNode,
			off = host.offset(),
			w = host ? host.outerWidth() : $(window).width(),
			h = host ? host.outerHeight() : $(window).height(),
			tw = uiDialog.innerWidth(),
			th = uiDialog.innerHeight(),
			tleft, ttop;
		tleft = (w-tw)/2;
		ttop = (h-th)/2;
		var rl = (off.left + tleft) < 0 ? 0 : off.left + tleft;
		var rt = (off.top + ttop) < 0 ? 0 : off.top + ttop;
		uiDialog.css({left: rl, top: rt});
		mask.css({left: off.left, top: off.top, width:w, height: h});

		titleArea.find('.ok-btn').on('click', function(){
			func();
			uiDialog.fadeOut(1000, function(){
				uiDialog.remove();
			});
			mask.fadeOut(1000, function(){
				mask.remove();
			});
		});
		titleArea.find('.cancel-btn').on('click', function(){
			uiDialog.fadeOut(1000, function(){
				uiDialog.remove();
			});
			mask.fadeOut(1000, function(){
				mask.remove();
			});
		});
	};

	Dialog.alert = function(content, maskNode){
		var	node = typeof node == 'object' ? node : $(node),
			uiDialog = $('<div class="ui-dialog"></div>'),
			contentArea = $('<div class="box-content"></div>'),
			titleArea = $('<div class="titleArea"></div>');
			mask = $('<div class="ui-mask"></div>');

		$(document.body).append(mask);
		uiDialog.append(titleArea);
		typeof content == 'string'? contentArea.html(content) : contentArea.append(content);
		uiDialog.append(contentArea);
		uiDialog.appendTo($(document.body)).fadeIn();
		maskNode = maskNode || $(document.body);

		var host = $.type(maskNode) == 'string' ? $(maskNode) : maskNode,
			off = host.offset(),
			w = host ? host.outerWidth() : $(window).width(),
			h = host ? host.outerHeight() : $(window).height(),
			tw = uiDialog.innerWidth(),
			th = uiDialog.innerHeight(),
			tleft, ttop;
		tleft = (w-tw)/2;
		ttop = (h-th)/2;
		var rl = (off.left + tleft) < 0 ? 0 : off.left + tleft;
		var rt = (off.top + ttop) < 0 ? 0 : off.top + ttop;
		uiDialog.css({left: rl, top: rt});
		mask.css({left: off.left, top: off.top, width:w, height: h});

		return {
			close: function(){
				uiDialog.fadeOut(1000, function(){
					uiDialog.remove();
				});
				mask.fadeOut(1000, function(){
					mask.remove();
				});
			}
		};
	};

	return Dialog;
});
