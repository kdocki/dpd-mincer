

var assert = require("assert")
var chai = require("chai")
var AssetPipeline = require("../index.js")
var ctx1 = require('./ctx1.js');

var m = new AssetPipeline('assets', {
	config: {
		paths: '../node_modules/dpd-mincer/test/assets/javascripts,../node_modules/dpd-mincer/test/assets/stylesheets'
	}
});

describe("testing JST", function() {
	it('should fetch some template files', function(done) {
		m.JST('../node_modules/dpd-mincer/test/assets/javascripts', function(jst) {
			console.log(jst);
			done();
		});
	});
});

//console.log (m.asset('application.css'));
//console.log(m.asset('application.css'));
//m.handle(ctx1, next);
