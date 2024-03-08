//Install Command:
//npm init
//npm i express express-handlebars body-parser mongoose

const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
}));

server.use(express.static('public'));


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/condodb');
const userModel = require('./models/User'); 
const condoModel = require('./models/Condo'); 

// can be added to hash the password for confidentiality
// const bcrypt = require('bcrypt'); 


var logStatus = 0; //0 for logged out, 1 for logged in and regular, 2 for owner
var logUsername = "";

const dataInfo = require("./DataInfo");
var dataCondo = dataInfo.getDataCondo();

server.get('/', function(req,resp){
    resp.render('home',{
        layout: 'index',
        title: 'Home Page'
    });
});

// create account POST
server.post('/create-account', function(req, resp){
    const user = userModel({
      user: req.body.username,
      pass: req.body.password
    });
    
    user.save().then(function(login) {
        console.log('Account created');
        resp.status(200).send({ success: true, message: 'Account created successfully' });
    }).catch(function(error) {
        // Check if the error indicates a duplicate key violation
        if (error.code === 11000 && error.name === 'MongoServerError') {
            // Handle duplicate key error
            resp.status(500).send({ success: false, message: 'Username already exists. Error creating account.' });
            console.error('Duplicate key error:', error.keyPattern);
        } else {
            console.error('Error creating account:', error);
            resp.status(500).send({ success: false, message: 'Error creating account' });
        }
    });
});

// Login POST 
server.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await userModel.findOne({ user: username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        // const passwordMatch = await bcrypt.compare(password, user.pass);

        if (password !== user.pass) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        logStatus = 1; //change to include owner
        logUsername = username;

        // Authentication successful
        res.status(200).json({ message: 'Login successful', user: user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// create review PATCH
server.patch('/create-review', async (req, resp) => {
    const { condoId, title, content, rating, image, date } = req.body;

    // Find the condo by ID
    const condo = await condoModel.findOne({ id: condoId });

    // Add reviews to the condo
    condo.reviews.unshift({
        title: title,
        content: content,
        rating: rating,
        image: image,
        date: date,
    });

    // Save the condo to the database
    condo.save()
    .then((savedCondo) => {
        console.log('Condo saved successfully:', savedCondo);
        resp.status(200).send({ success: true, message: 'Review published successfully' });
    })
    .catch((error) => {
        console.error('Error publishing review:', error);
        resp.status(500).send({ success: false, message: 'Error publishing review' });
    });

});

server.get('/condo/:condoId', function(req, resp){
    const condoId = req.params.condoId; // Retrieve the condo ID from the URL
    const formattedCondoId = condoId.replace('-', ' ').toUpperCase(); // Format the condo ID
    resp.render('condo', {
        layout: 'condo',
        title: formattedCondoId,
        'data': dataCondo.find(element => element.id === condoId),
    });
});

server.get('/loggedInStatus', function(req, resp){
    resp.send({
        status: logStatus, 
        username: logUsername
    });
});


//Only at the very end should the database be closed.
function finalClose(){
    console.log('Close connection at the end!');
    mongoose.connection.close();
    process.exit();
}

process.on('SIGTERM',finalClose);  //general termination signal
process.on('SIGINT',finalClose);   //catches when ctrl + c is used
process.on('SIGQUIT', finalClose); //catches other termination commands

const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Listening at port '+ port);
});