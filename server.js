var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Meet mom for lunch',
	completed: false
},
{
	id: 2,
	description: 'go to market',
	completed: false
},
{
	id: 3,
	description: 'feed the cat',
	completed: true
}];

//root
app.get('/', (req,res) => {
	res.send('Todo Api Root');
});

//get all todos
app.get('/todos', (req, res) => {
	res.json(todos);
});

app.get('/todos/:id', (req,res) => {
	var todoId = parseInt(req.params.id,20),
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

app.listen(PORT, () => {
	console.log('Express listening on port ' + PORT + '!');
});