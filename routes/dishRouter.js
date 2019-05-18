const express = require('express');
const bodyParser = require('body-parser');

const authenticate = require('../authenticate');
const cors = require('./cors');

const Dishes = require('../models/dishes');

const router = express.Router();

router.use(bodyParser.json());

// explicitly decalre all the end points - handle each one of them independently
router
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.find(req.query)
      .populate('comments.author')
      .then(
        dishes => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dishes);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      console.log(req.user);
      Dishes.create(req.body)
        .then(
          dish => {
            console.log('Dish Created ', dish);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end('PUT operation not supported on /dishes');
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.remove({})
        .then(
          resp => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

// declare all the end points for dishId
router
  .route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        dish => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end(`POST operation not supported on /dishes/${req.params.dishId}`);
    }
  )
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      {
        $set: req.body
      },
      { new: true }
    )
      .then(
        dish => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findByIdAndRemove(req.params.dishId)
        .then(
          resp => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

// declare all the end points for Comments
router
  .route('/:dishId/comments')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        dish => {
          // dish may not exist
          if (dish != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
          } else {
            // dish does not exist
            const err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null) {
            //  So, that users information is automatically obtained from the req.user
            // that is loaded into the body of the request message by the authenticate verify user
            // JWT strategy
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save().then(
              dish => {
                Dishes.findById(dish._id)
                  .populate('comments.author')
                  .then(dish => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                  });
              },
              err => next(err)
            );
          } else {
            err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /dishes/${req.params.dishId}/comments`
    );
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findById(req.params.dishId)
        .then(
          dish => {
            if (dish != null) {
              // remove each comment one at a time
              for (let i = dish.comments.length - 1; i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
                // dish.comments[i].remove();
              }
              dish.save().then(
                dish => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(dish);
                },
                err => next(err)
              );
            } else {
              const err = new Error(`Dish ${req.params.dishId} not found`);
              err.status = 404;
              return next(err);
            }
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

// declare all the end points for :commentId
router
  .route('/:dishId/comments/:commentId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      // check if dish exists and dish comment exists
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            // if dish does not exist
            err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            // dish exists but comment doesnt exist
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /dishes/${req.params.dishId}/comments/${
        req.params.commentId
      }`
    );
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          // check if dish exists and dish comment exists
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            // check if user is author of comment
            if (
              !req.user._id.equals(
                dish.comments.id(req.params.commentId).author
              )
            ) {
              err = new Error('You are not authorized to update this comment!');
              err.status = 403;
              return next(err);
            }
            // check if fields have been updated
            if (req.body.rating) {
              dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
              dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save().then(
              dish => {
                Dishes.findById(req.params.dish._id)
                  .populate('comments.author')
                  .then(dish => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                  });
              },
              err => next(err)
            );
          } else if (dish == null) {
            const err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            const err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            // check if user is author of comment
            if (
              !req.user._id.equals(
                dish.comments.id(req.params.commentId).author
              )
            ) {
              err = new Error('You are not authorized to delete this comment!');
              err.status = 403;
              return next(err);
            }

            dish.comments.id(req.params.commentId).remove();
            dish.save().then(
              dish => {
                Dishes.findById(dish._id)
                  .populate('comments.author')
                  .then(dish => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                  });
              },
              err => next(err)
            );
          } else if (dish == null) {
            err = new Error(`Dish ${req.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = router;
