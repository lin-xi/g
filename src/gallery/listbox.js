define(function(require, exports, module){
	var Dialog = require('leeme/dialog');
	var Event = require('leeme/event');

	function ListBox(opt){
		var DEFAULT_CONFIG = {
			node: '',
			editable: false,
			data: [],
			key: []
		};
		this.cfg = $.extend(DEFAULT_CONFIG, opt);
		this.cache={};
		this._init();

		Event.extend(this);
	}

	$.extend(ListBox.prototype, {
		_init: function(){
			var self = this, opt = self.cfg, node=$(opt.node),
				template = '<li title="{_id}"><span class="text">{name}</span></li>',
				template_edit = '<li><span class="delete" data-icon="&#xe1e8;"></span><span class="edit" data-icon="&#xe39b;"></span><span class="text">{name}</span></li>',
				pattern = /\{(.*?)\}/g,
				ul=$('<ul class="ui-listbox"></ul>');

			node.empty();
			var data = opt.data;
			for(var i=0, l=data.length; i<l; i++){
				var temp = opt.editable ? template_edit : template;
				var li = $(temp.replace(pattern, function(s0, s1){return data[i][s1];}));
				li.appendTo(ul);
				for(var k=0; k<opt.key.length; k++){
					li.data(opt.key[k], data[i][opt.key[k]]);
				}
			}
			node.append(ul);
			
			ul.bind('click', function(e){
				var nn = e.target.nodeName.toLowerCase();
				if(nn == 'span'){
					var p = $(e.target).parent();
					if(e.target.className == 'delete'){
						Dialog.confirm($(e.target), '亲，想好了？', function(){
							var param ={};
							for(var k=0; k<opt.key.length; k++){
								param[opt.key[k]] = p.data(opt.key[k]);
							}
							self.publish('delete', param);
							p.remove();
						});
					}

					if(e.target.className == 'edit'){
						
						if(!p.data('editMode')){
							var	input = $('<input type="text"></input>'),
								fp = p.find('.text');
							input.val(fp.text());
							p.children().hide();
							p.prepend(input);
							p.data('editMode', true);
								
							input.bind('keyup', function(e){
								if(e.keyCode == 13){
									var text = $.trim($(this).val());
									if( text != ""){
										fp.text(text);
										$(this).remove();
										p.children().show();
										p.data('editMode', false);
										var param ={};
										for(var k=0; k<opt.key.length; k++){
											param[opt.key[k]] = p.data(opt.key[k]);
										}
										param['name'] = text;
										self.publish('edit', param);
									}
								}
							})
						}
					}

					ul.find('li').removeClass('li-selected');
					node.data('currentValue', p.attr('title'));
					p.addClass('li-selected');
					self.publish('select', p.title);
				}
			});
		},

		reload: function(data){
			this.cfg.data = data;
			this._init();
		},

		getSelectedValue: function(){
			var node = $(this.cfg.node);
			return node.data('currentValue');
		}
	});
	return ListBox;
});
