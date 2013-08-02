define(function(require, exports, module){
	var Dialog = require('leeme/dialog');
	var _Event = require('leeme/event');
	var Scroll = require('leeme/scroll');

	function Table(opt){
		var DEFAULT_CONFIG = {
			node: '',
			title: '',
			editable: false,
			data: [],
			key: [],
			hasHeader: true,
			headers : [],
			columns: [],
			links:[],
			hasSumBar: true,
			sumColumns: []
		};
		this.cfg = $.extend(DEFAULT_CONFIG, opt);
		this.cache={};
		this._init();

		_Event.extend(this);
	}

	$.extend(Table.prototype, {
		_init: function(){
			var self = this, opt = self.cfg, node=$(opt.node),
				template_edit = '<span title="edit" class="icon" data-icon="&#xe39b;"></span>',
				template_delete = '<span title="delete" class="icon" data-icon="&#xe1e8;"></span>',
				pattern = /\{(.*?)\}/g,
				ul=$('<ul></ul>'),
				wraper = $('<div class="ui-table"><div class="head">表</div><div class="src-content"><div class="contentTable"></div></div><div class="foot"></div></div>');

			node.empty();

			wraper.find('.head').text(opt.title);
			if(opt.hasHeader){
				var headerLi = $('<li>'), hds = opt.headers;
				for(var i=0, l=hds.length; i<l; i++){
					$('<span class="text col'+(i+1)+'"></span>').text(hds[i]).appendTo(headerLi);
				}
				headerLi.appendTo(ul);
			}
			
			var data = opt.data, cols = opt.columns, sumCols = opt.sumColumns;
			if(data){
				var sums=[];
				for(var i=0, l=data.length; i<l; i++){
					var li = $('<li></li>');
					for(var j=0, n=cols.length; j<n; j++){
						var o = data[i];
						$('<span class="text col'+(j+1)+'"></span>').text(o[cols[j]]).appendTo(li);
					}
					for(var k=0; k<opt.key.length; k++){
						li.attr(opt.key[k], data[i][opt.key[k]]);
					}
					if(opt.hasSumBar){
						for(var x=0, y=sumCols.length; x<y; x++){
							var key1 = sumCols[x];
							var ls = sums[x] || 0;
							ls = ls + parseInt(o[key1]);
							sums[x] = ls;
						}
					}
					if(opt.editable){
						$(template_edit).appendTo(li);
						$(template_delete).appendTo(li)
					}
					li.attr('index', i);
					li.appendTo(ul);
				}
				
				var sumLi = $('<li></li>');
				$('<span class="sum"></span>').text('共'+data.length+'条记录').appendTo(sumLi);
				if(opt.hasSumBar){
					sumLi.empty();
					for(var j=0, n= cols.length; j<n; j++){
						var curcol = cols[j];
						for(var k=0, m = sumCols.length; k<m; k++){
							var key1 = sumCols[k];
							if(curcol == key1){
								$('<span class="text col'+(j+1)+'"></span>').text(sums[k]).appendTo(sumLi);
							} else {
								$('<span class="text col'+(j+1)+'"></span>').appendTo(sumLi);
							}
						}
					}
				}
				sumLi.appendTo(ul);
			}
			if(opt.editable){
				$('<button class="table-export-btn button">导出csv</button><button class="table-copy-btn button">复制</button><button class="table-add-btn button">添加新记录</button>').appendTo(wraper.find('.foot'));
			}
			wraper.find('.contentTable').append(ul);
			node.append(wraper);
			self.uiScroll = new Scroll(wraper.find('.src-content'));

			wraper.find('ul').on('click', function(e){
				var cache = self.cache;
				var nn = e.target.nodeName.toLowerCase();
				if(nn == 'span'){
					var p = $(e.target).parent();
					if(e.target.title == 'edit'){
						var eul=$('<ul class="ui-table-edit-panel"></ul>');
						if(opt.hasHeader){
							var hds = opt.headers; cols = opt.columns;
							var itemEle = p.find('.text');
							for(var i=0, l=cols.length; i<l; i++){
								var headerLi = $('<li>');
								$('<span class="field-label"></span>').text(hds[i]).appendTo(headerLi);
								$('<input id="'+ cols[i] +'" value="'+$(itemEle[i]).text()+'"></input>').appendTo(headerLi);
								headerLi.appendTo(eul);
							}
							Dialog.box(eul, wraper, function(){
								var param = {};
								for(var k=0; k<opt.key.length; k++){
									param[opt.key[k]] = p.attr(opt.key[k]);
								}
								eul.find('input').each(function(index, item){
									var itm = $(item);
									param[itm.attr('id')] = itm.val();
								});
								self.publish('edit', param);
							});
						}
					} else if (e.target.title == 'delete') {
						Dialog.confirm($(e.target), '亲，想好了？', function(){
							var param={};
							for(var k=0; k<opt.key.length; k++){
								param[opt.key[k]] = p.attr(opt.key[k]);
							}
							self.publish('delete', param);
							p.remove();
							self.uiScroll.render();
						});
					} else {
						wraper.find('li').removeClass('li-selected');
						p.addClass('li-selected');
						var idx = p.attr('index');
						var param = opt.data[idx];
						cache.selected = param;
						self.publish('select', param);
					}
				}
				e.stopPropagation();
				e.preventDefault();
			});
			// add button
			wraper.find('.table-add-btn').on('click', function(e){
				var cont = $('<div class="ui-table-edit-panel clearfix"></div>'),
					left = $('<div class="left"></div>'),
					right = $('<div class="right"></div>'),
					ul=$('<ul></ul>');
				if(opt.hasHeader){
					var hds = opt.headers; cols = opt.columns, links = opt.links;
					for(var i=0, l=cols.length; i<l; i++){
						var headerLi = $('<li>');
						$('<span class="field-label"></span>').text(hds[i]).appendTo(headerLi);
						if(links && links[i] && links[i]!=''){
							var sinput = $('<input id="'+ cols[i].replace('.', '_') +'" value="" readonly="true"></input>');
							sinput.appendTo(headerLi);
						} else {
							$('<input id="'+ cols[i] +'" value=""></input>').appendTo(headerLi);
						}
						headerLi.appendTo(ul);
					}
				}
				left.append(ul);
				cont.append(left);
				cont.append(right);
				Dialog.box(cont, wraper, function(){
					var param = {};
					ul.find('input').each(function(index, item){
						var itm = $(item);
						param[itm.attr('id')] = itm.val();
					});
					self.publish('add', param);
				});
			});
			//copy button
			wraper.find('.table-copy-btn').on('click', function(e){
				var cache = self.cache;
				if(cache.selected){
					self.publish('copy', cache.selected);
				}
			});
		},

		reload: function(opt){
			$.extend(this.cfg, opt);
			this._init();
		}
	});
	return Table;
});
