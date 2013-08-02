define(function(require, exports, module){
	var db = require('leeme/db');
	var ListBox = require('leeme/listbox');
	var Tips = require('leeme/tips');

	exports.create = function(database, opt, func){
		var node = $(opt.node);

		node.html('<div class="panel clearfix"><div class="left"><span class="title"></span><br><br><input id="name" type="text" placeholder="名称"><br><button id="add-btn" class="button">添加</button></div><div class="right"><div class="list"></div></div></div>');
		node.find('.title').text(opt.title);
		var listnode = node.find('.list'), 
			addbtn = node.find('#add-btn'),
			addinput = node.find('#name');

		var _db = db.db(database), ctl;
		opt.node = listnode;
		
		_db.allDocs(function(result){
			opt.data = result;
			ctl = new ListBox(opt);
			ctl.on('edit', function(e){
				var data = e.data;
				_db.save(data, function(re){
					if(re.ok == true){
						new Tips({position: 'top', content:'成功啦'});
					}
				});
			});
			ctl.on('delete', function(e){
				var data = e.data;
				_db.removeDoc(data, function(re){
					if(re.ok == true){
						new Tips({position: 'top', content:'成功啦'});
					}
				});
			});

			if(func){
				func();
			}
		});

		addbtn.click(function(){
			var name = addinput.val();
			if(name == ''){
				new Tips({node: addinput, position: 'right', content:'亲，别空着'});
				return;
			}
			var id = db.uuid();
			_db.save({_id:id, name:name}, function(re){
				if(re.ok == true){
					new Tips({node: addbtn, position: 'top', content:'成功啦'});
					addinput.val('');

					_db.allDocs(function(result){
						ctl.reload(result);
					});
				}
			});
		});
		return {reload: function(func){
			_db.allDocs(function(result){
				ctl.reload(result);
				if(func){
					func();
				}
			});
		}};
	};
});