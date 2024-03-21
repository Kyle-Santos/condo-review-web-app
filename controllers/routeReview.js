const userFunctions = require('../models/userFunctions');

function add(server){
    server.patch('/create-review', async (req, resp) => {
        const { condoId, title, content, rating, image, date } = req.body;
    
        userFunctions.createReview(condoId, title, content, rating, image, date, req.session.username);
        resp.status(200).send({ success: true, message: 'Review published successfully', user: req.session.username, job: req.session.job, icon: req.session.picture });
    });
}

module.exports.add = add;