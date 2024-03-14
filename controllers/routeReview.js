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
    server.patch('/create-review', async (req, resp) => {
        const { condoId, title, content, rating, image, date } = req.body;
    
        userFunctions.createReview(condoId, title, content, rating, image, date, logUsername);
        resp.status(200).send({ success: true, message: 'Review published successfully', user: logUsername, job: logUserJob, icon: logIcon });
    });

    
}

module.exports.add = add;
module.exports.editLoginStatus = editLoginStatus;