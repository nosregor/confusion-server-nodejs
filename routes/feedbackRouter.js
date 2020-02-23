const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Feedbacks = require('../models/feedbacks');

const feedbackRouter = express.Router();

feedbackRouter.use(bodyParser.json());

feedbackRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    if (req.body != null) {
      Feedbacks.create(req.body)
        .then(
          feedback => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(feedback);
          },
          err => next(err)
        )
        .catch(err => next(err));
    } else {
      err = new Error('Feedback not found in request body');
      err.status = 404;
      return next(err);
    }
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /feedbacks/');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Feedbacks.remove({})
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = feedbackRouter;
