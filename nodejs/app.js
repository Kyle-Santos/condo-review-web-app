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

server.get('/', function(req,resp){
    resp.render('home',{
        layout: 'index',
        title: 'Home Page'
    });
});

server.get('/condo', function(req, resp){
    resp.render('condo',{
        layout: 'index',
        title: 'View Condo'
    })
});

const port = process.env.PORT || 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});

server.post('/loginAjax', function(req, resp){
    logStatus = 1; //change to include owner
    logUsername = req.body.username;
    let password = req.body.password;

    //insert check if passwords and username match

    console.log(logUsername + ' ' + password);

    resp.send(logUsername);
});