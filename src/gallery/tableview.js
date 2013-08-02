define(function(require, exports, module){
	var Dialog = require('leeme/dialog');
	var Event = require('leeme/event');
	var Table = require('leeme/amsTable');
	var Scroll = require('leeme/scroll');

	function TableView(opt){
		var DEFAULT_CONFIG = {
			node: '',
			title: '',
			editable: false,
			data: [],
			key: [],
			hasHeader: true,
			headers : [],
			columns: [],
			hasSumBar: true,
			sumColumns: []
		};
		this.cfg = $.extend(DEFAULT_CONFIG, opt);
		this.cache={};
		this._init(this.cfg.data);

		Event.extend(this);
	}

	$.extend(TableView.prototype, {
		_init: function(data){
			var self = this, opt = self.cfg, node=$(opt.node),
				template_edit = '<span title="edit" class="icon" data-icon="&#xe39b;"></span>',
				template_delete = '<span title="delete" class="icon" data-icon="&#xe1e8;"></span>',
				pattern = /\{(.*?)\}/g,
				ul=$('<ul></ul>'),
				wraper = $('<div class="ui-table"><div class="head">表</div><div class="src-content"><div class="contentTable"></div></div><div class="foot"></div>');

			node.empty();
			$('<div class="searchbar"><div class="keyarea clearfix"><span class="searchIcon" data-icon="&#xe01b;"></span></div></div>').appendTo(node);
			$('.searchIcon').on('click', function(){
				setupEditPanel('search');
			});

			wraper.find('.head').text(opt.title);
			if(opt.hasHeader){
				var headerLi = $('<li>'), hds = opt.headers;
				for(var i=0, l=hds.length; i<l; i++){
					$('<span class="text col'+(i+1)+'"></span>').text(hds[i]).appendTo(headerLi);
				}
				headerLi.appendTo(ul);
			}
			
			var cols = opt.columns, sumCols = opt.sumColumns;
			if(data){
				var sums=[];
				for(var i=0, l=data.length; i<l; i++){
					var li = $('<li></li>');
					for(var j=0, n=cols.length; j<n; j++){
						var o = data[i], lkey = cols[j], lid = o[cols[j]];
						$('<span class="text col'+(j+1)+'" _id="'+o[lkey]+'"></span>').text(o[lkey+'_content']).appendTo(li);
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
				if(opt.hasSumBar){
					for(var j=0, n= cols.length; j<n; j++){
						var curcol = cols[j];
						for(var k=0, m = sumCols.length; k<m; k++){
							var key1 = sumCols[k];
							if(curcol == key1){
								$('<span class="text col'+(j+1)+'"></span>').text(sums[k]).appendTo(li);
							} else {
								$('<span class="text col'+(j+1)+'"></span>').appendTo(li);
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
			new Scroll(wraper.find('.src-content'));

			wraper.find('ul').on('click', function(e){
				var cache = self.cache;
				var nn = e.target.nodeName.toLowerCase();
				if(nn == 'span'){
					var p = $(e.target).parent();
					if(e.target.title == 'edit'){
						var itemEle = p.find('.text');
						setupEditPanel('edit', p, itemEle);
					
					} else if (e.target.title == 'delete') {
						Dialog.confirm($(e.target), '亲，想好了？', function(){
							var param={};
							for(var k=0; k<opt.key.length; k++){
								param[opt.key[k]] = p.data(opt.key[k]);
							}
							self.publish('delete', param);
							p.remove();
						});
					} else {
						wraper.find('li').removeClass('li-selected');
						p.addClass('li-selected');
						var idx = p.attr('index');
						var param = data[idx];
						cache.selected = param;
						self.publish('select', param);
					}
				}
			});

			function setupEditPanel(mode, curli, eles){
				var cont = $('<div class="ui-table-edit-panel clearfix"></div>'),
					left = $('<div class="left"></div>'),
					right = $('<div class="right"></div>'),
					ul=$('<ul></ul>');
				if(opt.hasHeader){
					var hds = opt.headers; cols = opt.columns;
					for(var i=0, l=cols.length; i<l; i++){
						var headerLi = $('<li>');
						$('<span class="field-label"></span>').text(hds[i]).appendTo(headerLi);
						if(cols[i].indexOf('.') != -1){
							var sinput;
							if(mode=='init'){
								sinput = $('<input id="'+ cols[i].replace('.', '_') +'" value="" readonly></input>');
							}else if(mode == 'edit'){
								sinput = $('<input id="'+ cols[i].replace('.', '_') +'" _id="'+$(eles[i]).attr('_id')+'" value="'+$(eles[i]).text()+'" readonly></input>');
							}else if(mode == 'search'){
								sinput = $('<input id="'+ cols[i].replace('.', '_') +'" value="" readonly></input>');
							}
							sinput.appendTo(headerLi);

							(function(obj, col){
								var a = col.split('.');
								obj.on('click', function(){
									var div = $('<div class="'+a[0]+'"></div>');
									var stb = Table.create(a[0], {
										node: div,
										title: o.name,
										editable: false,
										key: ['_id', '_rev'],
										hasHeader: true,
										select: function(da){
											if(mode == 'search'){
												obj.val(da[obj.attr('id').split('_')[1]]);
												obj.attr('_id', da['_id']);
											}else{
												for(var prop in da){
													var ipt = $('#'+a[0]+'_'+prop);
													if(ipt){
														ipt.val(da[prop]);
														ipt.attr('_id', da['_id']);
													}
												}
											}
										}
									});
										
									right.empty().append(div);
								});
							})(sinput, cols[i]);

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
					var param = {}, keywords={}, keyparam={};
					ul.find('input').each(function(index, item){
						var itm = $(item);
						param[itm.attr('id').replace('_', '.')] = itm.attr('_id');
						
						if(itm.val() != ''){
							keywords[itm.prev().text()] = itm.val();
							keyparam[itm.attr('id').replace('_', '.')] = itm.val();
						}
					});
					if(mode == 'init'){
						self.publish('add', param);
					}else if(mode == 'edit'){
						for(var k=0; k<opt.key.length; k++){
							param[opt.key[k]] = curli.attr(opt.key[k]);
						}
						self.publish('edit', param);
					}else if(mode == 'search'){
						for(var key in keywords){
							$('<span class="keyword">'+key + ':'+keywords[key]+'<a class="closebtn">×</a></span>').appendTo($('.keyarea'));
						}
						$('.closebtn').on('click', function(e){
							$(e.target).parent().remove();
						});
						searchData(keyparam);
					}
				});
			}
			//add button
			wraper.find('.table-add-btn').bind('click', function(e){
				setupEditPanel('init');
			});
			//copy button
			wraper.find('.table-copy-btn').on('click', function(e){
				var cache = self.cache;
				if(cache.selected){
					self.publish('copy', cache.selected);
				}
			});
			//export button
			wraper.find('.table-export-btn').on('click', function(e){
				self.publish('export', data);
			});

			function searchData(keywords){
				var newdata=[];
				for(var i=0, l=opt.data.length; i<l; i++){
					var record = opt.data[i];
					var flag = true;
					for(var key in keywords){
						if(record[key] != keywords[key] && record[key+'_content'] != keywords[key]){
							flag = false;
							break;
						}
					}
					if(flag){
						newdata.push(record);
					}
				}
				self.reload({data: newdata}, true);
			}
		},

		reload: function(config, flag){
			if(!flag){
				$.extend(this.cfg, opt);
			}
			this._init(config.data);
		},

		getSelectedValue: function(){
			return node.data('currentValue');
		}
	});
	return TableView;
});
