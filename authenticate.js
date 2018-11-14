const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const config = require('./config.js');

const User = require('./models/users');


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
  // creates JWT - supply payload
  return jwt.sign(user, config.secretKey,
    // 1 hour
    { expiresIn: 3600 });
};

const opts = {};
// extracting the JWT
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
  (jwt_payload, done) => {
    console.log('JWT payload: ', jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      }

      return done(null, false);
    });
  }));

// Verify an incoming user JWT strategy - we dont create sessions, we are using token based
exports.verifyUser = passport.authenticate('jwt', { session: false });

// The token will be included in the authenticatoin header, its then extracted and used to
// authtenticate the user
