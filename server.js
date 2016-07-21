var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

var todoModel = {
	id:{
		type:'number',
		searchType:'exact'
	},
	complete:{
		type:'boolean',
		searchType:'exact'
	},
	description: {
		type:'string',
		searchType:'includes'
	},
}

var todos = [{
	id:1,
	complete: false,
	description: 'item 1'
},
{
	id:2,
	complete: true,
	description: 'item 2',
}];

var todoNextId = 3;

var validKeys = ['description', 'complete', 'id'];

coerceToModelType = function (obj) {
	var keys = _.keys(obj);

	for (i=0,l=keys.length;i<l;i++){

		var key = keys[i]

		if (todoModel[key].type === 'boolean') {
			if (obj[key].toLowerCase().trim() === 'true') {
				obj[key] = true;
			} else if (obj[key].toLowerCase().trim() === 'false') {
				obj[key] = false;
			}
		} else if (todoModel[key].type === 'number') {
			if (!isNaN(parseInt(obj[key]))) {
				obj[key] = parseInt(obj[key]);
			}
		} else if (todoModel[key].type === 'string') {
			obj[key].toString();
		}
	}
	return obj;
}

app.use(bodyParser.json());

//root
app.get('/', (req,res) => {
	res.send('Todo Api Root');
});

//get all todos
app.get('/todos', (req, res) => {
	if (req.query) {
		var query = _.pick(req.query, validKeys); // trim any query params not in the accepted params list
		query = coerceToModelType(query);         // coerce each query value to the type of it's param in the todoModel object
		selectedTodos = todos;					  // set selectedTodos to todos so we don't modify the actual todos object accidentally
		// selectedTodos = _.where(todos,query);

		//query is object of query keys and values
		//queryKeys is array of each param in query

		var queryKeys = _.keys(query);

		for (i=0,l=queryKeys.length;i<l;i++) {

			// if (todoModel[queryKeys[i]].searchType === 'exact') {
			// 	selectedTodos = _.where(selectedTodos,);
			// } else if (model demands includes) {
			// 	selectedTodos = _.filter(selectedTodos, (todo) => {
			// 		return
			// 	});
			// }

			var queryKey = queryKeys[i] //current query key
			var queryItem = query[queryKey] //current query "item"
			var todoModelProperty = todoModel[queryKey] // todoModel property matching this query

			selectedTodos = _.filter(selectedTodos, (todo) => {
				if (todoModel[queryKey].searchType === 'exact') {
					return queryItem === todo[queryKey];
				} else if (todoModel[queryKey].searchType === 'includes') {
					return todo[queryKey].toLowerCase().indexOf(queryItem.toLowerCase()) > -1
				} else {
					return true;
				}
			});
		}
	}

	res.json(selectedTodos);
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
	var body = _.pick(req.body, validKeys);

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

//edit a todo
app.put('/todos/:id',(req,res) => {
	var todoId = parseInt(req.params.id,10),
		todo = _.findWhere(todos,{id: todoId});

	if (!todo) {
		return res.status(404).send();
	}

	var validKeys = ['description', 'complete'],
		body = _.pick(req.body, validKeys);

	var validAttributes = {};

	if (body.hasOwnProperty('complete') && _.isBoolean(body.complete)) {
		validAttributes.complete = body.complete;
	} else if (body.hasOwnProperty('complete')) {
		return res.status(400).send();
	} else {
		//never provided attribute
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	} else {
		//never provided attribute
	}

	// things went right
	_.extend(todo, validAttributes);

	res.json(todo);

});

app.listen(PORT, () => {
	console.log('Express listening on port ' + PORT + '!');
});