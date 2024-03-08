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

const loginSchema = new mongoose.Schema({
    user: { type: String },
    pass: { type: String }
  },{ versionKey: false });

const loginModel = mongoose.model('login', loginSchema);


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


server.post('/create-account', function(req, resp){
    const loginInstance = loginModel({
      user: req.body.username,
      pass: req.body.password
    });
    
    loginInstance.save().then(function(login) {
        console.log('Account created');
        resp.status(200).send({ success: true, message: 'Account created successfully' });
    }).catch(function(error) {
        console.error('Error creating account:', error);
        resp.status(500).send({ success: false, message: 'Error creating account' });
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


server.post('/loginAjax', function(req, resp){
    
    logUsername = req.body.username;
    let password = req.body.password;

    //insert check if passwords and username match

    console.log(logUsername + ' ' + password);

    resp.send(logUsername);
    logStatus = 1; //change to include owner
});

server.get('/loggedInStatus', function(req, resp){
    resp.send({
        status: logStatus, 
        username: logUsername
    });
});


const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Listening at port '+ port);
});