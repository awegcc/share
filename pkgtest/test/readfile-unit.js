const fs = require('fs');
var filename='index.js';

describe('File', function(){
	describe('#readFile()', function(){
    	it('should read test.ls without error', function(done){
	    	fs.readFile(filename, function(err){
				if (err) throw err;
				done();
			});
		})
	})
})
