let request = require('request'),
	express = require('express'),
	api = require('../'),
	API = api.API,
	Method = api.Method;

let server = express(),
	myApi = new API();

server.use('/api', myApi.router);
server.listen(12345);

function fetch(method, cb){
	request('http://localhost:12345/api/' + method, (err, res, body) => {
		if(err)return cb(err);
		let b = JSON.parse(body);
		cb(b.error, b.response);
	});
}

describe('testing API', () => {
	it('test.getOne', done => {

		myApi.addMethod(new Method('test.getOne', (req, res) => {
			res.ok(1)
		}));

		fetch('test.getOne', (err, res) => {
			if(err || res !== 1){
				done(err || new Error(res));
			}else {
				done();
			}
		})
	});

	describe('test.calc', () => {

		myApi.addMethod(new Method('test.calc', {
				params: {
					a: Number,
					b: Number,
				}},
			function(req, res) {
				res.ok(req.params.a + req.params.b);
			}));

		it('a=1 b=1', done => {
			fetch('test.calc?a=1&b=1', function (err, res) {
				if (err || res !== 2){
					done(err || new Error(res));
				} else {
					done();
				}
			});
		});
		it('a=500 b=25', done => {
			fetch('test.calc?a=500&b=25', function (err, res) {
				if (err || res !== 525){
					done(err || new Error(res));
				} else {
					done();
				}
			});
		});


	});

	describe('test.showParams', ()=>{

		myApi.addMethod(new Method('test.showParams', {
				params: {
					num0: Number,
					num1: {type: Number, minValue: 10},
					num2: {type: Number, maxValue: 15},
					num3: {type: Number, required: true},
					str0: String,
					str1: {type: String, maxLength: 10},
					str2: {type: String, maxLength: 10, strict: true},
					bln0: Boolean
				}},
			function(req, res) {
				res.ok(req.params);
			}));


		it('test1', done => {
			fetch('test.showParams?num3=11&str1=123456789abcdef', function (err, res) {
				if (err){
					done(new Error(JSON.stringify(err)));
				} else {
					console.log(res);
					done();
				}
			});
		});

		it('test2', done => {
			fetch('test.showParams?num3=11&str1=123456789abcdef&str2=123456789a&bln0=1', function (err, res) {
				if (err){
					done(new Error(JSON.stringify(err)));
				} else {
					console.log(res);
					done();
				}
			});
		})
	})
});