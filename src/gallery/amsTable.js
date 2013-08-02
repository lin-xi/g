define(function(require, exports, module){
	var db = require('leeme/db');
	var Table = require('leeme/table');
	var Tips = require('leeme/tips');

	exports.create = function (database, opt, func){
		var _db = db.db(database);
		var	tbl;

		getData('init');

		function getData(mode){
			_db.allDocs(function(result){
				opt.headers = [];
				opt.columns = [];
				for(var i=0; i<result.length; i++){
					var res = result[i];
					if(res.sys_type == '_sys_define_'){
						for(var key in res){
							if(key != '_id' && key != '_rev' && key != 'sys_type'){
								opt.headers.push(res[key]);
								opt.columns.push(key);
							}
						}
						result.splice(i, 1);
					}
				}
				if(opt.editable){
					opt.headers.push('编辑');
				}
				if(mode == 'init'){
					setup(result);
					if(func) func();
				}else{
					refresh(result);
					if(func) func();
				}
			});
		}

		function setup(result){
			opt.data = result;
			tbl = new Table(opt);
			tbl.on('add', function(e){
				var data = e.data;
				_db.save(data, function(re){
					if(re.ok == true){
						new Tips({node: '.table-add-btn', position: 'top', content:'成功啦'});
						getData('refresh');
					}
				});
			});
			tbl.on('edit', function(e){
				var data = e.data;
				_db.removeDoc(data, function(re){
					if(re.ok == true){
						delete data['_rev'];
						_db.save(data, function(re){
							if(re.ok == true){
								new Tips({node: '.table-add-btn', position: 'top', content:'成功啦'});
								getData('refresh');
							}
						});
					}
				});
			});
			tbl.on('delete', function(e){
				var data = e.data;
				_db.removeDoc(data, function(re){
					if(re.ok == true){
						new Tips({node: '.table-add-btn', position: 'top', content:'成功啦'});
						if(func){
							func();
						}
					}
				});
			});
			tbl.on('select', function(e){
				opt.select(e.data);
			});
			tbl.on('copy', function(e){
				var data = e.data;
				_db.copyDoc(data._id, function(re){
					if(re.ok == true){
						new Tips({node: '.table-add-btn', position: 'top', content:'成功啦'});
						getData('refresh');
					}
				});
			});
		}

		function refresh(res){
			tbl.reload({data: res});
		}

		return {reload: function(func){
			getData('refresh');
		}};
	};

});
	