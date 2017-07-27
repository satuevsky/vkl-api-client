/**
 * Created by Islam on 23.03.2017.
 */

let	express = require('express');

module.exports = class API{

	/**
	 * API constructor
	 * @param {Object} params
	 * @param {Object} [params.context] - this object will pass to all request's res param
	 * @param {Object} [params.io] - SocketIO server
	 */
	constructor(params){
		params = params || {};
		this.router = express.Router();
		this.context = params.context;

		this.methods = {};
		this.middlewares = [];

		if(params.io){
			setWS(this, params.io);
		}
	}

	/**
	 * Add middleware
	 * @param {Function} middleware
	 */
	use(middleware){
		this.middlewares.push(middleware);
	}

	/**
	 * Add method to API
	 * @param {ApiMethod} method
	 * @param {string} [path]
	 */
	addMethod(method, path){
		this.methods[method.name] = method;

		path = path || '/' + method.name;
		this.router && this.router.get(path, (req, res) => {
			res.ok = function(data){
				res.json({response: data});
			};
			res.error = function(error){
				res.json({error: error});
			};
			execMethod(this, method, req, res);
		});
	}
};


function execMethod(self, method, req, res){
	let middlewares = self.middlewares;
	req.method = method;
	req.context = self.context;

	loop(0);

	function loop(i){
		if(i < middlewares.length){
			middlewares[i](req, res, () => {
				loop(i+1);
			})
		}else{
			method.execute(req, res);
		}
	}
}

function setWS(self, io){
	io.on('connection', (socket) => {
		socket.on('api', (data, fn) => {
			onRequest(socket, data, fn);
		})
	});

	function onRequest(socket, data, fn) {
		let req = {query: data, socket: socket},
			res = {ok: ok, error: error},
			method = self.methods[data.method];
		if(!method)
			return error({code: "UNKNOWN_METHOD"});

		execMethod(self, method, req, res);

		function ok(data){
			fn && fn({response: data});
		}
		function error(error){
			fn && fn({error: error});
		}
	}
}