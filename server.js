var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

//root
app.get('/', (req,res) => {
	res.send('Todo Api Root');
});

//get all todos
app.get('/todos', (req, res) => {
	res.json(todos);
});

//get a specific todo
app.get('/todos/:id', (req,res) => {
	var todoId = parseInt(req.params.id,10),
		l = todos.length,
		todo;

	for (i=0;i<l;i++) {
		if (todos[i].id === todoId) {
			todo = todos[i];
		}
	}

	//res.send('Asking for todo with id of ' + req.params.id);

	if (todo) {
		res.json(todo);
	} else {
		res.status(404).send('todo not found with id of ' + todoId);
	}
});

//post a todo
app.post('/todos',(req, res) => {
	var body = req.body;

	body.id = todoNextId++;
	todos.push(body);

	res.json(body);
});

app.listen(PORT, () => {
	console.log('Express listening on port ' + PORT + '!');
});