var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

app.get('/', (req,res) => {
	res.send('Todo Api Root');
});

app.listen(PORT, () => {
	console.log('Express listening on port ' + PORT + '!');
});