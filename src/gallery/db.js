define(function(require, exports, module){

	require('script/jquery.couch.js');

	function _cdb(){
	}

	var couch = $.couch;
	function error(status, error, reason){
		alert('status:['+status+'] error:['+error+'] reason:['+reason+']');
	}

	exports.login = function(username, password, success){
		couch.login({
			name: username,
			password: password,
			success: success || $.noop,
			error: error
		});
	};

	exports.logout = function(){

	};
	
	exports.uuid = function(){
		return couch.newUUID();
	}

	exports.db = function(name){
		var _db = couch.db(name);
		return {
			allDocs: function(success){
				_db.allDocs({
					include_docs: true,
					conflicts: true,
					success: function(re){
						var rs = re.rows, ret = [];
						for(var i=0, l=rs.length; i<l; i++){
							ret.push(rs[i].doc);
						}
						success(ret);
					},
					error: error
				});
			},

			openDoc: function(docId, success){
				_db.openDoc(docId, {success: function(re){
					success(re);
				}, error: error})
			},

			save: function(doc, func){
				_db.saveDoc(doc, {success: func||$.noop, error: error});
			},

			bulkSave: function(docs){

			},

			removeDoc: function(doc, func){
				_db.removeDoc(doc, {success: func||$.noop, error: error});
			},

			bulkRemove: function(docs){

			},

			copyDoc: function(id, func){
				_db.copyDoc(id, {success: func||$.noop, error: error});
			},

			query: function(mapFun, reduceFun, language){

			},

			list: function(list){

			},

			view: function(name){

			}
			
		};
	}
});
