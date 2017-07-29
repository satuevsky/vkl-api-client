class ApiClient{
	constructor(params){
		this.endpoint = params.endpoint || "";
		this.token = params.token;
	}

	call(method, params, callback){
		if(typeof params === "function") {
			callback = params;
			params = {};
		}else{
			params = params || {};
		}

		if(this.token)params.token = this.token;

		let query = paramsToQueryString(params),
			url = this.endpoint + 'api/' + method + (query.length && ('?' + query) || "");

		return new Promise(function(resolve, reject){
			fetch(url, {credentials: 'same-origin'})
				.then(json)
				.then((res) =>{
					if(callback){
						callback(res.error, res.response);
					}else{
						res.error ? reject(res.error) : resolve(res.response);
					}
				})
				.catch(err => {
					if(callback){
						callback(err || new Error());
					}else{
						reject(err);
					}
				});
		});
	}
}

function json(res){
	return res.json();
}

function paramsToQueryString(params){
	let pairs = [],
		name;
	for(name in params){
		let val = params[name];
		if(val === undefined) continue;
		pairs.push(name + "=" + encodeURIComponent(val));
	}
	return pairs.join("&");
}


export default ApiClient;

