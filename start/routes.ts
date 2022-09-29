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
  Route.post('/new-password', 'AuthController.generateNewPassTokenAndSendItWithProducer')
  Route.post('/reset-password', 'AuthController.resetPassword')
}).prefix('/auth')

Route.group(() => {
  Route.post('/new', 'UsersController.store')
  Route.get('/my-account', 'UsersController.retrievesUsersInfo').middleware('auth')
  Route.put('/user-update', 'UsersController.userUpdate').middleware('auth')
  Route.delete('/user-delete', 'UsersController.userDestroy').middleware('auth')

  Route.get('/all', 'UsersController.index').middleware(['auth', 'is:admin'])
  Route.get('/:id', 'UsersController.show').middleware(['auth', 'is:admin'])
  Route.put('/admin-update/:id', 'UsersController.adminUpdate').middleware(['auth', 'is:admin'])
  Route.delete('/admin-delete/:id', 'UsersController.adminDestroy').middleware(['auth', 'is:admin'])

  Route.post('/become-a-customer', 'UsersController.sendUserRequestToBecomeACustomer').middleware(['auth', 'is:user'])
}).prefix('/users')

Route.group(() => {
  Route.post('/admin/add/:id', 'AuthController.addAdminPermissionToUser')
  Route.post('/admin/remove/:id', 'AuthController.removeAdminPermissionFromUser')
  Route.post('/user/add/:id', 'AuthController.addBasicUserPermissionToUser')
  Route.post('/user/remove/:id', 'AuthController.removeBasicUserPermissionFromUser')
}).prefix('/permission').middleware(['auth', 'is:admin'])

Route.group(() =>{
  Route.get('/all', 'CustomersController.listAllCustomers').middleware(['auth', 'is:admin'])
  Route.post('/bank-statement/:cpf', 'CustomersController.getCustomerBankStatement').middleware(['auth', 'is:admin'])
  Route.post('/transfer/make', 'CustomersController.makeTransfer').middleware(['auth', 'is:customer'])
}).prefix('/customers')
