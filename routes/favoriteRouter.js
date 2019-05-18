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
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user })
      .populate('user')
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
    const { dishes } = req.body;

    Favorite.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);

      if (favorite === null) {
        Favorite.create({ user: req.user._id }).then(favorite => {
          for (let i = 0; i < dishes.length; i++) {
            if (favorite.dishes.indexOf(dishes[i]) === -1) {
              favorite.dishes.push(dishes[i]);
            }
          }
          favorite
            .save()
            .then(favorite => {
              Favorite.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then(favorite => {
                  console.log('Favourite created!');
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                })
                .catch(err => {
                  return next(err);
                });
            })
            .catch(err => {
              return next(err);
            });
        });
      } else {
        for (let i = 0; i < dishes.length; i++) {
          if (favorite.dishes.indexOf(dishes[i]) !== -1) {
            favorite.dishes.push(dishes[i]);
          }
          favorite
            .save()
            .then(favorite => {
              Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then(favorite => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                });
            })
            .catch(err => {
              next(err);
            });
        }
      }
    });
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(
        favorite => {
          if (favorite != null) {
            favorite.remove().then(
              resp => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
              },
              err => next(err)
            );
          } else {
            const err = new Error('Favorite not found');
            err.status = 404;
            return next(err);
          }
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
    console.log(req.user._id);
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
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // console.log('DEBUG PARAMS: ', req.params);
    Favorite.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);

      // if such a document corresponding to this user does not already exist
      if (!favorite) {
        Favorite.create({ user: req.user._id })
          // create a favorite document
          .then(favorite => {
            favorite.dishes.push({ _id: req.params.dishId });
            favorite
              .save()
              .then(favorite => {
                Favorite.findById(favorite._id)
                  .populate('user')
                  .populate('dishes')
                  .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                  })
                  .catch(err => next(err));
              })
              .catch(err => next(err));
          })
          .catch(err => next(err));
      }

      if (favorite.dishes.indexOf(req.params.dishId) !== -1) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(`Dish ${req.params.dishId} already exits!`);
      }

      // favorite.dishes.push(req.params.dishId);
      favorite.dishes.push(req.body);
      favorite
        .save()
        .then(favorite => {
          Favorite.findById(favorite._id)
            .populate('user')
            .populate('dishes')
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
            .catch(err => next(err));
        })
        .catch(err => {
          return next(err);
        });
    });
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);

      console.log(favorite);
      const index = favorite.dishes.indexOf(req.params.dishId);

      if (index >= 0) {
        favorite.dishes.splice(index, 1);
        favorite.save();
        favorite
          .save()
          .then(favorite => {
            Favorites.findById(favorite._id)
              .populate('user')
              .populate('dishes')
              .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              });
          })
          .catch(err => {
            return next(err);
          });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Dish ${req.params._id} not found`);
      }
    });
  });

module.exports = router;
