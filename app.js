//Install Command:
//npm init
//npm i express express-handlebars body-parser mongoose multer

const express = require('express');
const server = express();
const path = require('path');

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
    helpers: {
        // Define your custom helper functions here
        if_eq: function(a, b, opts) {
            if (a === b) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        }
    }
}));

server.use(express.static('public'));


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/condodb');

const controllers = ['routeUser', 'routeCondo', 'routeReview'];

for(i = 0; i < controllers.length; i++){
    const ctrl = require('./controllers/' + controllers[i]); 
    ctrl.add(server);
}

// can be added to hash the password for confidentiality
// const bcrypt = require('bcrypt'); 

server.post('/upload-image', upload.single('image'), (req, res) => {
    // Get the temporary file path of the uploaded image
    const tempFilePath = req.file.path;

    if (fs.existsSync(tempFilePath)) {
        const destinationPath = path.join(__dirname, 'public', 'images', 'client-uploaded-files', req.file.originalname);
        // Move the uploaded file to the destination path
        fs.rename(tempFilePath, destinationPath, err => {
            if (err) {
                console.error('Error:', err);
                res.status(500).send('Error saving image');
            } else {
                console.log('Image saved successfully');
                res.status(200).send('Image uploaded successfully');
            }
        });
    } else {
        return res.status(400).send('Uploaded file not found');
    }
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