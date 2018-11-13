const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/users');

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  console.log('DEBUG Body', req.body);

  User.findOne({ username: req.body.username })
    .then((user) => {
      console.log('DEBUG User:', user);
      if (user != null) {
        const err = new Error(`User ${req.body.username} already exists!`);
        err.status = 403;
        next(err);
      } else {
        return User.create({
          username: req.body.username,
          password: req.body.password,
        });
      }
    })
    .then((user) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ status: 'Registration Successful!', user });
    }, err => next(err))
    .catch(err => next(err));
});

router.post('/login', (req, res, next) => {
  console.log('DEBUG Session:', req.session);
  console.log('DEBUG Headers:', req.headers.authorization);

  if (!req.session.user) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    User.findOne({ username })
      .then((user) => {
        // we couldnt find user return Error
        if (user === null) {
          const err = new Error(`User ${username} does not exist!`);
          err.status = 403;
          return next(err);
        }
        // user exists but password is wrong
        if (user.password !== password) {
          const err = new Error('Your password is incorrect!');
          err.status = 403;
          return next(err);
        }
        // user and password correctly identified
        if (user.username === username && user.password === password) {
          req.session.user = 'authenticated';
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('You are authenticated!');
        }
      })
      .catch(err => next(err));
  } else {
    // if already set user is already logged in
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(); // destroy session on server side
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
