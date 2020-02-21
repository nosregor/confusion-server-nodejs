const express = require('express');
const bodyParser = require('body-parser');

const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorite = require('../models/favorites');

const router = express.Router();

router.use(bodyParser.json());

router
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .populate('dishes')
      .then(
        favorites => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const dishes = [...req.body.values()];
    const filter = { user: req.user._id };
    const update = { $addToSet: { dishes: { $each: dishes } } };
    const options = { upsert: true, new: true }; // Make this update into an upsert

    Favorite.findOneAndUpdate(filter, update, options)
      .populate('user')
      .populate('dishes')
      .then(
        favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then(
        favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

router
  .route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(
        favorite => {
          if (!favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ exists: false, favorite: favorite });
          } else {
            if (favorite.dishes.indexOf(req.params.dishId) < 0) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.json({ exists: false, favorite: favorite });
            } else {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.json({ exists: true, favorite: favorite });
            }
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
    // console.log('favorites/:dishId');
    // res.statusCode = 403;
    // res.end('GET operation not supported on /favorites/:dishId');
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { dishId } = req.params;

    const filter = { user: req.user._id };
    const update = { $addToSet: { dishes: dishId } };
    const options = { upsert: true, new: true }; // Make this update into an upsert

    Favorite.findOneAndUpdate(filter, update, options)
      .populate('user')
      .populate('dishes')
      .then(
        favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { dishId } = req.params;

    const filter = { user: req.user._id };
    const update = { $pull: { dishes: dishId } };
    const options = { new: true };

    Favorite.findOneAndUpdate(filter, update, options)
      .populate('user')
      .populate('dishes')
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

module.exports = router;
