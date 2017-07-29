export default class API{
	constructor(params){
		this.endpoint = params.endpoint || "";
		this.token = params.token;
	}

	call(method, params){
		params = params || {};
		if(this.token)params.token = this.token;

		let query = paramsToQueryString(params),
			url = 'api/' + method + (query.length && ('?' + query) || "");

		return new Promise(function(resolve, reject){
			fetch(url, {credentials: 'same-origin'})
				.then(json)
				.then((res) =>{
					res.error ? reject(res.error) : resolve(res.response);
				})
				.catch(reject);
		});
	}
};


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