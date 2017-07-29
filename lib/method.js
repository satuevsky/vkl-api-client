/**
 * Created by Islam on 21.03.2017.
 */

class ApiMethod {
	constructor(name, opts, executor){
		opts = opts || {};

		if(!name || typeof name !== "string" || !name ){
			throw new Error('Invalid name property');
		}

		if(typeof opts === "function"){
			executor = opts;
			opts = null;
		}

		if(typeof executor !== "function"){
			throw new Error("invalid executor");
		}

		opts = opts || {};

		this.name = name;

		this._executor = executor;

		//api parameters
		this.params = typeof opts.params === "object" ? ApiMethod.normalizeParams(opts.params) : null;
	}

	execute(req, res) {
		let params = this.params ? ApiMethod.prepareParams(req.query, this.params) : {};
		if (params === false)
			return res.error({code: "INVALID_PARAMS"});

		req.params = params;
		this._executor(req, res);
	};

	static normalizeParams(params){
		let required = [],
			all = [];

		for(let name in params){
			if(params.hasOwnProperty(name)){
				let param = params[name];

				if(typeof param === "function"){
					param = {type: param, name: name}
				}else{
					param.name = name;
				}

				if(param.type === Number){
					param._minValue = Number.isFinite(param.minValue);
					param._maxValue = Number.isFinite(param.maxValue);
					param._default = Number.isFinite(param.default);
				}

				if(param.required && !param.default){
					required.push(param);
				}
				all.push(param);
			}
		}

		return {
			required: required,
			all: all
		}
	}
	static prepareParams(query, params){
		let prepared = Object.create(params),
			i, param, qval, val;

		//checking required
		for(i = 0; i < params.required.length; i++)
			if(!query[params.required[i].name])return false;

		//preparing
		for(i = 0; i < params.all.length; i++){
			param = params.all[i];
			qval = query[param.name];

			if(!qval){
				val = param.default || param.type();
			}else{
				if(param.type === Boolean && (qval === "0" || qval === "false")){
					val = false;
				}else{
					val = param.type(qval);

					if(param.type === Number && Number.isNaN(val)){
						if(param.required)return false;
						val = param.default || 0;
					}

					if(param.type === String && param.maxLength && val.length > param.maxLength)
						if(!param.strict){
							val = val.substr(0, param.maxLength)
						}else{
							return false;
						}
				}
			}
			if(param.type === Number){
				if(param._minValue && val < param.minValue){
					if(param.required)return false;
					val = param.minValue;
				}
				if(param._maxValue && val > param.maxValue){
					if(param.required)return false;
					val = param.maxValue;
				}
			}

			prepared[param.name] = val;
		}
		return prepared;
	}
}

module.exports = ApiMethod;