var Sequelize = require('Sequelize')
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect':'sqlite',
  'storage': __dirname + '/basic-sqlite-database.sqlite'
})

var Todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len:[1, 250]
    }
  },
  complete: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
})

sequelize.sync({force:true}).then(function () {
  console.log('Everthing is synced')

  Todo.create({
    description: 'Walking my dog',
    complete: false
  }).then((todo) => {
    return Todo.create({
      description: 'Clean the office'
    })
  }).then(() => {
    // return Todo.findById(1);
    return Todo.findAll({
      where: {
        description:{
          $like: '%office%'
        }
      }
    })
  }).then((todos) => {
    if (todos) {
      todos.forEach(function (todo) {
        console.log(todo.toJSON())
      })
    } else {
      console.log('no todo found')
    }
  }).catch((e) => {
    console.log(e)
  })
})
