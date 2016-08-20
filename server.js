// comment

var express = require('express')
var bodyParser = require('body-parser')
var _ = require('underscore')
var db = require('./db.js')
var bcrypt = require('bcryptjs')
var middleware = require('./middleware.js')(db)

var app = express()
var PORT = process.env.PORT || 3000

var validKeys = {
  todo: ['description', 'complete'],
  user: ['email', 'password']
}

app.use(bodyParser.json())

// GET Root
app.get('/', function (req, res) {
  res.send('Todo Api Root')
})


// GET /todos - get all todos
app.get('/todos', middleware.requireAuthentication, function (req, res) {

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

  db.todo.findAll({where: where}).then( function (todos) {
    res.json(todos)
  }, function (err) {
    res.status(500).send()
  })

})


// GET todos/:id - get a specific todo - get a todo by id - get todo by id
app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {
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

})


// POST /todos - post a todo - create a todo
app.post('/todos', middleware.requireAuthentication, function (req, res) {
  var body = _.pick(req.body, validKeys.todo)

  db.todo.create(body).then( function (todo) {
    req.user.addTodo(todo).then(function () {
      return todo.reload()
    }).then(function (todo) {
      res.json(todo.toJSON())
    })
  }, function (e) {
    res.status(400).json(e)
  })
})


// DELETE /todos/:id - delete a todo - delete todo by id - delete a todo by id
app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {

  var todoId = parseInt(req.params.id, 10)

  db.todo.findById(todoId).then( function (todo) {
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


// PUT /todos/:id - update a todo - update todo by id - update a todo by id
app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {

  var todoId = parseInt(req.params.id, 10)
  var body = _.pick(req.body, validKeys.todo)
  var attributes = {}

  if (body.hasOwnProperty('complete')) {
    attributes.complete = body.complete
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description
  }

  db.todo.findById(todoId).then(function (todo) {
    if (todo) {
      todo.update(attributes).then(function (todo) {
        res.json(todo.toJSON())
      }, function (err) {
        res.status(400).json(err)
      })
    } else {
      res.status(404).send()
    }
  }, function (err) {
    res.status(500).send()
  })

})

// POST /users - create a user - create user
app.post('/users', function (req, res) {
  var body = _.pick(req.body, validKeys.user)

  db.user.create(body).then( function (user) {
    res.json(user.toPublicJSON())
  }, function (err) {
    res.status(400).json(err)
  })
})

// POST /users/login - login as a user - login - login user
app.post('/users/login', function (req, res) {
  var body = _.pick(req.body, validKeys.user)

  db.user.authenticate(body).then( function (user) {
    var token = user.generateToken('authentication')
    if (token) {
      res.header('Auth', token).json(user.toPublicJSON())
    } else {
      res.status(401).send()
    }

  }, function (err) {
    res.status(401).send()
  })

})

// start sequelize and listen on port
db.sequelize.sync({force:true}).then(function () {
  app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!')
  })
})
