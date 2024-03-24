const userFunctions = require('../models/userFunctions');

function add(server){
    server.patch('/create-review', async (req, resp) => {
        const { condoId, title, content, rating, image, date } = req.body;
    
        userFunctions.createReview(condoId, title, content, rating, image, date, req.session.username);
        resp.status(200).send({ success: true, message: 'Review published successfully', user: req.session.username, job: req.session.job, icon: req.session.picture });
    });

    // create comment POST
    server.post('/create-comment', async (req, resp) => {
        let createSuccess, createStatus, createMessage;

       [createSuccess, createStatus, createMessage] = await userFunctions.createComment(req.session._id, req.body.content, req.body.date, req.body.reviewId);

        resp.status(createStatus).send({success: createSuccess, message: createMessage, user: req.session});
    });
}

module.exports.add = add;