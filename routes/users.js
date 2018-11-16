const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const authenticate = require('../authenticate');
const cors = require('./cors');

const User = require('../models/users');

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    })
    .catch(err => next(err));
});

// user registration
router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err });
      } else {
        if (req.body.firstname) { user.firstname = req.body.firstname; }
        if (req.body.lastname) { user.lastname = req.body.lastname; }
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' });
          });
        });
      }
    });
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  // when the user authenticates on the /login endpoint and the user is successfully authenticated,
  // the token will be created by the server and sent back to the client or the user.
  const token = authenticate.getToken({ _id: req.user._id }); // takes a payload which is the user_id

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  // add in token in reply message
  res.json({ success: true, token, status: 'You are successfully logged in!' });
});

// So, the client will include the token in every subsequent incoming request in the authorization header.
// Now, how does it include the authorization header?
// go back to authentic.js and you see that we said ExtractJWT.fromAuthHeaderAsBearerToken here.
// So, this will be included in the authentication header as a bearer token.
// I'll show you how this is done, then we use postman to include the bearer token into the authentication header.

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(); // destroy session on server side
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error('You are not logged in!');
    err.status = 403;
    console.log(err);
    next(err);
  }
});

module.exports = router;
