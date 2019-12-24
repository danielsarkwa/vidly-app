# Vidly-app

* This app is a movies rental application for store.
* It has a main admin who can add new users and delete user.

# Major upgrades to make
  - Improve database integrity in application to match the business logic.
      ex: deleted only when autorized(when it obeys the set database integrity)
  
  - Improving code base with classes and functions  

## Basic routes
  - localhost:6202/api/users : to create a new account (POST)
     #### NB: The creating of users can only be done by admins
       - to by pass this, in the <project_folder_name>/routes/users.js, remove "[auth, admin]" from the post route function.
       - The business entity on creating the users is:
          ##### Admins
              - name
              - email
              - password
              - role
              - isAdmin : true 
          ##### Other users
              - name
              - email
              - password
              - role
        - After creating the admin user, add the "[auth, admin]" back to the post route

    - localhost:6202/api/auth : to login to the app
       - logging to the app, you will receive a token the header response (x-auth-token) to use the other route of the app.

    - localhost:6202/api/genres : to work with movie genres
       * Routes
          - GET : to get all genres
          - POST : to add new genre (only takes a name property)

          - localhost:6202/api/genres/:id
            - PUT : to update a genre
            - DELETE : to delete a genre

    - localhost:6202/api/movies : to work with movie
       * Routes
          - GET : to get all movies
          - POST : to add new movies (takes title, genre(use the id), numberInStock, dailyRentalRate)

          - localhost:6202/api/movies/:id
            - PUT : to update a movies
            - DELETE : to delete a movies

    - localhost:6202/api/customers : to work with customer
       * Routes
          - GET : to get all customers
          - POST : to add new customer (takes name, isGold(this is boolean), phone)

          - localhost:6202/api/customers/:id
            - PUT : to update a customer
            - DELETE : to delete a customer

    - localhost:6202/api/rentals : to work with rental
       * Routes
          - GET : to get all rentals
          - POST : to add new rental (takes customerId, movieId)

          - localhost:6202/api/rentals/:id
            - PUT : to update a rental
            - DELETE : to delete a rental

    - localhost:6202/api/returns/:id : to make return on a rental (POST)

## Running the application
 * Clone the appication
 * cd into <project_folder>
 * run SET vidly_jwtPrivateKey=mySecureKey to add node env
    - if you have a mongodb install start it before running the application
    - if you have mongodb atlas, run SET vidly_db=<your_database_link>
 * run npm start to start the application