/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.get('/hello', async () => {
    return { hello: 'world' }
  })
  Route.get('/db_connection', 'TestsController.checksDBConnection')
  Route.get('/admin', 'TestsController.checksIfUserIsAdmin').middleware(['auth', 'is:admin'])
  Route.get('/customer', 'TestsController.checksIfUserIsCustomer').middleware(['auth', 'is:customer'])
  Route.get('/user', 'TestsController.checksIfUserIsBasic').middleware(['auth', 'is:user'])
}).prefix('/tests')

Route.group(() => {
  Route.post('/login', 'AuthController.login')
}).prefix('/auth')

Route.resource('/users', 'UsersController').apiOnly()
