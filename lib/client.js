"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApiClient = function () {

	/**
  * @param {Object} [params]
  * @param {String} [params.endpoint] - api endpoint
  * @param {Object} [params.extraParams] - extra parameters for each request
  */
	function ApiClient() {
		var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, ApiClient);

		this.endpoint = params.endpoint || "";
		this.extraParams = params.extraParams;
	}

	_createClass(ApiClient, [{
		key: "call",
		value: function call(method, params, callback) {
			if (typeof params === "function") {
				callback = params;
				params = {};
			} else {
				params = params || {};
			}

			if (this.extraParams) {
				var key = void 0;
				for (key in this.extraParams) {
					if (this.extraParams.hasOwnProperty(key) && !params.hasOwnProperty(key)) params[key] = this.extraParams[key];
				}
			}

			params.v = params.v || "5.68";

			var query = paramsToQueryString(params),
			    url = this.endpoint + method + (query.length && '?' + query || "");

			return new Promise(function (resolve, reject) {
				fetch(url, { credentials: 'same-origin' }).then(json).then(function (res) {
					if (callback) {
						callback(res.error, res.response);
					} else {
						res.error ? reject(res.error) : resolve(res.response);
					}
				}).catch(function (err) {
					if (callback) {
						callback(err || new Error());
					} else {
						reject(err);
					}
				});
			});
		}
	}]);

	return ApiClient;
}();

function json(res) {
	return res.json();
}

function paramsToQueryString(params) {
	var pairs = [],
	    name = void 0;
	for (name in params) {
		var val = params[name];
		if (val === undefined) continue;
		pairs.push(name + "=" + encodeURIComponent(val));
	}
	return pairs.join("&");
}

exports.default = ApiClient;