class ApiClient{

	/**
	 * @param {Object} [params]
	 * @param {String} [params.endpoint] - api endpoint
	 * @param {Object} [params.extraParams] - extra parameters for each request
	 */
	constructor(params = {}){
		this.endpoint = params.endpoint || "";
		this.extraParams = params.extraParams;
	}

	call(method, params, callback){
		if(typeof params === "function") {
			callback = params;
			params = {};
		}else{
			params = params || {};
		}

		if(this.extraParams){
			let key;
			for(key in this.extraParams){
				if(this.extraParams.hasOwnProperty(key) && !params.hasOwnProperty(key))
					params[key] = this.extraParams[key];
			}
		}

		params.v = params.v || "5.68";

		let query = paramsToQueryString(params),
			url = this.endpoint + method + (query.length && ('?' + query) || "");

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

