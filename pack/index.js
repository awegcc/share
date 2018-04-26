var http = require('http');

var cnt=0;
http.createServer( (request, response) => {
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.end('Hello World\n....');
			console.log(`A request come, count ${cnt++}`);
			}
		).listen(8080); 
console.log('Server started');
