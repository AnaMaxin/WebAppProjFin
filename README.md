## Installation of "Products from Everyone"- A Full-Stack Web Application

### 1. Install PostgreSQL.

The application uses PostgreSQL for database management; therefore, it is required that PostgreSQL is installed
on the server. If you don't have it already installed, please install it. Here is the link where you can find the details about installation:
https://www.postgresql.org/download/

When the installer asks you to select the components to be installed, please make sure to select **PostgreSQL Server** and **Command Line Tools**.

### 2. Install Node.js.

You can download it from the following link: https://nodejs.org/en/download

### 3. Create the database and the database administrator.

Open the **SQL Shell(psql)** command line tool.

You will be prompted to enter the server. By default, it is the localhost. Hit enter to keep the default.
Next, you will be asked to enter the database. By default, it is "postgres". Leave it as "postgres" by hitting enter.
You will be prompted to enter the port number. You should go with the default (this is 5432) if you haven't previously set another port number for postgreSQL.
Then, you will be prompted to enter the username, by default this is postgres. Leave it as postgres for now.
You will need to introduce the password, please introduce the password you selected during installation.
If everything went well, you should see _"postgres=#"_ on the next line.

We will now create a new user who will be the administrator of our database.
Run the following command:

`CREATE USER admin01 WITH ENCRYPTED PASSWORD '5432';`.

You can choose some other username and password as you like. But please don't forget them.

Create the database with the following command:
`CREATE DATABASE web_application_database;`.  
Again, you can choose whatever name you want for the database, but don't forget it.

Now switch to the new database with the following command:

`\c web_application_database` (or the name of your database).

Within the database run the following commands to grant all the privileges to the previously created user.
`GRANT ALL PRIVILEGES ON DATABASE web_application_database TO admin01;`
`REVOKE ALL ON schema public FROM public;`
`GRANT ALL ON schema public TO admin01;`

Type `\q` to terminate the session and close the SQL Shell(psql) window.

### 4. Create the database tables.

Open again the SQL Shell(psql) command line tool. Keep the localhost as a server by hitting enter.
You will be prompted to enter the database, type
`web_application_database` (or your database name) and hit enter.
Select your port number or stay with the default, which is usually 5432.
Then, you will be prompted to enter the username, type `admin01` or the name you chose previously.
Type the password. I previously chose it as `5432` , like the port number to be easier to remember it. You must enter your password.
If you connected successfully, you should see _web_application_datbase=>_ at the beginning of a new line (or the name of your database).

Run the following command to run the script that creates all the tables of the database. Instead of _path_ you should paste the path to where you stored the root directory of the project.

`\i path/WebAppProjFin/server/database.sql`
If the script runs successfully you should see _CREATE TABLE_ printed 6 times on the console.

### 5. Configure the db.js file.

To connect the server to the database you need to configure the **pg.Pool** object inside the _db.js_ file, which is located in the server folder of this project _WebAppProjFin/server/db.js_
Open the file with a text editor and initialize the Pool object with the correct parameters that apply to your database. If you named everything as I did when I created the database, you should have the pool object initialized with the following data:

`const pool = new Pool({
user: "admin01",  
password: "5432",    
host: "localhost",  
port: 5432,  
database: "web_application_database",  
});`

### 6. Configure the port number of the server.

Open the `index.js` file located in the folder called _server_ (not the one located in the _client_ folder): _WebAppProjFin/server/index.js_
Find the following lines of code:
`app.listen(5000, () => {
console.log("server has started on port 5000");
});`  
The server is set to listen on the port 5000, you can change this port number with another available port number, if that suits your case. If you change it, please adapt the `console.log` line to print the correct port number.

### 7. Make the ip address and the port number of the server known to the client program.

Now open the file called `SignIn.js` located in the _WebAppProjFin/client/src/components folder_. You will find the following lines of code right at the end of the import statements at the top of the page:
`const ipAddress = "localhost";
const port = "5000";`
These two statements should contain the ip address and the port number the server is listening on. You should set them to the actual ip adress and port number of the server.

### 8. Optionally change the port number of the client program. It is set to 3000 by default.

Open the file called `package.json` located in the _WebAppProjFin/client_ directory. Look for
`"scripts":{
"start": "cross-env PORT=3000 && react-scripts start", 
...
}`
Change the port number to the one you want the client program to listen on.

### 9. Install the dependencies and start the server program.

Open a new terminal window and go to the server folder, by running
`cd path_to_server` where instead of _path_to_server_ type the path to the _WebAppProjFin/server folder, as you have it on your machine.
Inside the server folder, run the following command to install all the dependencies:
`npm install`
This might take a few minutes to run.
Once it is finished, start the server with the following command:
`node index`
You should see the following message: \_server has started on port 5000_.
Instead of 5000 you might have another port number if you changed it during step 6.
Now the server component of the web application is running.

### 10. Install the dependencies and start the client program.

Open another terminal window and go to the _WebAppProjFin/client_ folder, using the `cd` command as you did for the server during step 9.
Inside the client folder, run the following command to install all the dependencies.
`npm install`
This will take a bit longer to run than it took for the server part, because we have much more dependencies in the client program.
After it has finished, start the client program with the following command:
`npm start`
Now we have the client side running as well. We can access the application in the browser at the following address "http://localhost:3000", if we are on the local machine and we set the port to 3000. We can also access it from another machine connected to the local network, with the correct ip address and port number.

### 11. Use pictures during testing.

If you want to test the web application and want to upload pictures, I provided some suitable pictures in the _docs_phase3/test_pictures_ folder.
