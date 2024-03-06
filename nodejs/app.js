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

server.get('/:condoId', function(req, resp){
    const condoId = req.params.condoId; // Retrieve the condo ID from the URL
    const formattedCondoId = condoId.replace('-', ' ').toUpperCase(); // Format the condo ID
    resp.render('condo', {
        layout: 'condo',
        title: formattedCondoId,
        'data': dataCondo.find(element => element.id === condoId),
    });
});

const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Listening at port '+ port);
});

server.post('/loginAjax', function(req, resp){
    logStatus = 1; //change to include owner
    logUsername = req.body.username;
    let password = req.body.password;

    //insert check if passwords and username match

    console.log(logUsername + ' ' + password);

    resp.send(logUsername);
});