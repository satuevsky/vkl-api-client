class ApiClient{
	/**
	 * @param {Object} [params]
	 * @param {String} [params.endpoint] - api endpoint
	 * @param {Object} [params.extraParams] - extra parameters for each request
	 * @param {Boolean|Number} [params.requestsFrequency]
	 * @param {Function} [params.fetch] - fetch method(for Node)
	 */
	constructor(params = {}){
		this.endpoint = params.endpoint || "";
		this.extraParams = params.extraParams;
		this.freq = params.requestsFrequency ?
			(typeof params.requestsFrequency === "number" ? params.requestsFrequency : 333) : null;
		this.lastRequestTime = 0;

		this.fetch = params.fetch || window.fetch.bind(window);
	}

	/**
	 * Do request to API
	 * @param {String} method - Method name
	 * @param {Object} [params] - Request parameters
	 * @param [callback] - Callback for request
	 * @return {Promise}
	 */
	call(method, params, callback){
		return new Promise((resolve, reject) => {
			let timeout = 0;
			if(this.freq){
				let now = Date.now(),
					diff = now - this.lastRequestTime;

				if(diff < this.freq){
					timeout = this.freq - diff;
				}
				this.lastRequestTime = now + timeout;
			}

			setTimeout(() => {
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

				let query = paramsToQueryString(params),
					url = this.endpoint + method + (query.length && ('?' + query) || "");

				this.fetch(url, {credentials: 'same-origin'})
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
			}, timeout);
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

