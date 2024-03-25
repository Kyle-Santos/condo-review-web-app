const reviewModel = require('../models/Review');
const userModel = require('../models/User');
const userFunctions = require('../models/userFunctions');

var logStatus = 0;
var logUsername = "";
var logIcon = "";
var logUserJob = "Condo Bro";

function editLoginStatus(newStatus, newUsername, newIcon, newJob){
    logStatus = newStatus;
    logUsername = newUsername;
    logIcon = newIcon;
    logUserJob = newJob;
}

function add(server){
    server.post('/search-review', function(req, resp){
        var text = req.body.text;
        var condoId = req.body.condoId;
        var listOfReviews = new Array();

        var searchQuery = {condoId: condoId};

        reviewModel.find(searchQuery).then(function(reviews){
            for(const item of reviews){
                if(item.content.includes(text) || item.title.includes(text)){
                    listOfReviews.push(item);
                }
            }
        });
        
    });

    server.patch('/create-review', async (req, resp) => {
        const { condoId, title, content, rating, image, date } = req.body;
    
        userFunctions.createReview(condoId, title, content, rating, image, date, logUsername);
        resp.status(200).send({ success: true, message: 'Review published successfully', user: logUsername, job: logUserJob, icon: logIcon });
    });

    
}

module.exports.add = add;
module.exports.editLoginStatus = editLoginStatus;