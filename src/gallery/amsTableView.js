define(function(require, exports, module){
	var db = require('leeme/db');
	var Table = require('leeme/tableview');
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
				opt.headers.push('编辑');
				if(result.length == 0){
					if(mode == 'init'){
						setup(result);
						func();
					}else{
						refresh(result);
						func();
					}
				}else{
					adaptData(result, function(){
						if(mode == 'init'){
							setup(result);
							func();
						}else{
							refresh(result);
							func();
						}
					});
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
			tbl.on('copy', function(e){
				console.log(e.data);
				var data = e.data;
				delete data['_id'];
				delete data['_rev'];
				for(var key in data){
					if(key.indexOf('_content') != -1){
						delete data[key];
					}
				}
				_db.save(data, function(re){
					if(re.ok == true){
						new Tips({node: '.table-add-btn', position: 'top', content:'成功啦'});
						getData('refresh');
					}
				});
			});
			tbl.on('export', function(e){
				console.log(e.data);
				var ed = e.data, line=[], str='';
				for(var i=0, ii=ed.length; i<ii; i++){
					var o = ed[i];
					for(var key in o){
						if(key.indexOf('_content') != -1){
							line.push(o[key]);
						}
					}
					str += line.join(',') + '\n' + '<br>';
				}
				var winname = window.open('', '_blank', 'top=10000');
				winname.document.open('text/html', 'replace');
				winname.document.writeln(str);
				//winname.close();
			});
		}

		function refresh(res){
			tbl.reload({data: res});
		}

		function adaptData(result, func){
			var ready = 0, count = 0;
			for(var i=0, ii=result.length; i<ii; i++){
				var o = result[i], count2=0;
				if(!ready){
					for(var key in o){
						count2++;
					}
					ready = (count2-2)*result.length;
				}
				for(var key in o){
					if(key != '_id' && key != '_rev'){
						(function(obj, k){
							var a = k.split('.');
							db.db(a[0]).openDoc(o[k], function(re){
								obj[k+'_content'] = re[a[1]];
								count++;
								if(count == ready){
									func();
								}
							});
						})(o, key)
					}
				}
			}
		}

		return {reload: function(func){
			getData('refresh');
		}};
	};

});
	