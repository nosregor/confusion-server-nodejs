/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const authenticate = require('../authenticate');
const cors = require('./cors');

const User = require('../models/users');

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
});

router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
    .then(users => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    })
    .catch(err => next(err));
});

// user registration
router.post('/signup', cors.corsWithOptions, (req, res) => {
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err });
    }

    if (req.body.firstname) {
      user.firstname = req.body.firstname;
    }

    if (req.body.lastname) {
      user.lastname = req.body.lastname;
    }

    user.save((err, user) => {
      if (err) {
        console.log(`Error saving user: ${user}`);
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
  });
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, status: 'Login Unsuccessful!', err: info });
    }
    req.logIn(user, err => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          success: false,
          status: 'Login Unsuccessful!',
          err: 'Could not log in user!'
        });
      }

      const token = authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, status: 'Login Successful!', token });
    });
  })(req, res, next);
});

// So, the client will include the token in every subsequent incoming request in the authorization header.
// Now, how does it include the authorization header?
// go back to authentic.js and you see that we said ExtractJWT.fromAuthHeaderAsBearerToken here.
// So, this will be included in the authentication header as a bearer token.
// I'll show you how this is done, then we use postman to include the bearer token into the authentication header.

router.get('/logout', (req, res, next) => {
  console.log('DEBUG LOGOUT: ', req.headers);

  if (req.headers.authorization) {
    delete req.headers.authorization; // destroy session on server side
    res.redirect('/');
  } else {
    const err = new Error('You are not logged in!');
    err.status = 403;
    console.log(err);
    next(err);
  }
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      token,
      status: 'You are successfully logged in!'
    });
  }
});

router.get('/checkJWTtoken', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ status: 'JWT invalid!', success: false, err: info });
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json({ status: 'JWT valid!', success: true, user });
  })(req, res);
});

module.exports = router;
