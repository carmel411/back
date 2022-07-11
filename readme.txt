This is a server side of a story publishing site. The site is intended for parents, teachers and children in the religious community and now the site is running and its address is https://readandgrow.web.app/home.
Server Side - https://github.com/carmel411/back
Client side - https://github.com/carmel411/poster

The server side uses nodeJs + expres.
A CORS package was also installed to prevent CORS problems.

The donor database is MONGODB and access to it is through MONGOOSE.

The site is designed for four types of users: guest, registered user, writer and administrator.
A guest can only read content on the site.

A registered user can also mark his favorites and the data is saved in the database.
A writer (who has received permission from the webmaster) can also upload new stories to the site and also has the option to edit and delete stories that he himself has uploaded.
The administrator has the ability to edit and delete any story and in addition he can manage the users and give or remove writing permission to the other users.
Before any action that is restricted to some users there is middleware that verifies the user data and checks that it has the appropriate permission.

Each user who registers for the site produces an encrypted TOKEN using JWT. The TOKEN is fixed with an encrypted ID as well as user status.

The server also allows sending emails using a nodemailer package, such as in the case of forgetting a password.

All requests received on the server are recorded in the ACCESSLOG file and can be viewed.

The main requests that the server handles:

User registration
User login
Editing a user profile (including uploading a profile picture and storing it)
Add a post to the user's favorites

Create a post
Editing a post
Delete post
Receiving a post according to ID
Receiving a group of posts according to a list of favorites
Receiving a group of posts according to a consultation
Receive all posts