//comment

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;

var validKeys = ['description', 'complete', 'id'];

app.use(bodyParser.json());


//root
app.get('/', (req, res) => {
  res.send('Todo Api Root');
});


//get all todos
app.get('/todos', (req, res) => {

  var query = req.query
  var where = {}

  if (query.hasOwnProperty('complete') && query.complete === 'true') {
    where.complete = true
  } else if (query.hasOwnProperty('complete') && query.complete === 'false') {
    where.complete = false
  }

  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      $like: '%' + query.q + '%'
    }
  }

  db.todo.findAll({where: where}).then(function (todos) {
    res.json(todos)
  }, function (err) {
    res.status(500).send()
  })

});


// GET todos/:id
app.get('/todos/:id', (req, res) => {
  var todoId = parseInt(req.params.id, 10)

  db.todo.findById(todoId).then(function (todo) {
    if (!!todo) {
      res.json(todo.toJSON())
    } else {
      res.status(404).send()
    }
  }, function (err) {
    res.status(500).send()
  })

});


//post a todo
app.post('/todos', (req, res) => {
  var body = _.pick(req.body, validKeys);

  db.todo.create(body).then((todo)=>{
    res.json(todo.toJSON());
  },(e)=>{
    res.status(400).json(e);
  });
});


//delete a todo
app.delete('/todos/:id', (req, res) => {

  var todoId = parseInt(req.params.id, 10)

  db.todo.findById(todoId).then(function (todo) {
    todo.destroy().then(
      function (todo) {
        res.json(todo)
      },
      function (err) {
        res.status(500).send()
      }
    )
  }, function (err) {
    res.status(404).json({
      error: 'no todo found with id: ' + todoId
    })
  })
})

//edit a todo
app.put('/todos/:id', (req, res) => {
  var todoId = parseInt(req.params.id, 10),
    todo = _.findWhere(todos, {
      id: todoId
    });

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

db.sequelize.sync().then(function(){
  app.listen(PORT, () => {
    console.log('Express listening on port ' + PORT + '!');
  });
});
