//Install Command:
//npm init
//npm i express express-handlebars body-parser mongoose

const express = require('express');
const server = express();

// saving uploaded image
const multer = require('multer');
const fs = require('fs');

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/client-uploaded-files'); // Set destination folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use original filename
    }
});

const upload = multer({ storage: storage }); // Store uploaded files in the 'uploads' directory

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
        title: 'Home Page',
        isHome: true
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

// Logout POST
server.post('/logout', function(req, resp){
    logStatus = 0;
    logUsername = "";

    resp.send({});
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

// get condo from the db GET
server.get('/condo/:condoId', async (req, resp) => {
    const condoId = req.params.condoId; // Retrieve the condo ID from the URL
    const formattedCondoId = condoId.replace('-', ' ').toUpperCase(); // Format the condo ID

    try {
        // Query MongoDB to get data
        var data = await condoModel.findOne({ id: condoId });
        data = {name: data.name, address: data.address, rating: data.rating, img: data.img, description: data.description, reviews: data.reviews};

        resp.render('condo', {
            layout: 'index',
            title: formattedCondoId,
            'data': data,
            isCondo: true
        });
    } catch (err) {
        // Handle errors
        console.error('Error fetching data from MongoDB', err);
        resp.status(500).json({ error: 'Failed to fetch data' });
    }
});

server.get('/loggedInStatus', function(req, resp){
    resp.send({
        status: logStatus, 
        username: logUsername
    });
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

server.post('/upload-image', upload.single('image'), (req, res) => {
    // Get the temporary file path of the uploaded image
    const tempFilePath = req.file.path;
    console.log(tempFilePath);
    if (fs.existsSync(tempFilePath)) {
        const destinationPath = path.join('public/images/client-uploaded-files', req.file.originalname);
        // Move the uploaded file to the destination path
        fs.rename(tempFilePath, destinationPath, err => {
            if (err) {
                console.error('Error:', err);
                res.status(500).send('Error saving image');
            } else {
                console.log('Image saved successfully');
            }
        });
    } else {
        return res.status(400).send('Uploaded file not found');
    }
});


// get profile GET
server.get('/profile/:username', async (req, resp) => {
    const username = req.params.username; // Retrieve the condo ID from the URL

    try {
        // Query MongoDB to get data
        var data = await userModel.findOne({ user: username });
        data = {user: data.user, bio: data.bio, email: data.email, job: data.job, education: data.education, city: data.city};

        resp.render('viewprofile', {
            layout: 'index',
            title: data.user,
            'data': data,
            isProfile: true
        });
    } catch (err) {
        // Handle errors
        console.error('Error fetching data from MongoDB', err);
        resp.status(500).json({ error: 'Failed to fetch data' });
    }
});

// get edit profile GET
server.get('/edit-profile/', function(req, resp) {
    resp.render('editprofile',{
        layout: 'index',
        title: 'Edit Profile',
        isEditProfile: true
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