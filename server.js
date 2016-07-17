var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
		todo = _.findWhere(todos,{id: todoId});

	if (todo) {
		res.json(todo);
	} else {
		res.status(404).send('todo not found with id of ' + todoId);
	}
});

//post a todo
app.post('/todos',(req, res) => {
	var validKeys = ['description', 'complete'],
		body = _.pick(req.body, validKeys);

	if (!_.isBoolean(body.complete) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.description = body.description.trim();

	body.id = todoNextId++;

	todos.push(body);

	res.json(body);
});

//delete a todo
app.delete('/todos/:id', (req,res) => {
	var todoId = parseInt(req.params.id,10),
		todo = _.findWhere(todos,{id:todoId});

	if (!todo) {
		return res.status(404).json({"error":"no todo found with id: " + todoId});
	}

	todos = _.without(todos,todo);
	res.json(todo);
})

app.listen(PORT, () => {
	console.log('Express listening on port ' + PORT + '!');
});