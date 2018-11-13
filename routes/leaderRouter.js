const express = require('express');
const bodyParser = require('body-parser');

// add model
const Leader = require('../models/leaders');

const router = express.Router();
router.use(bodyParser.json());

router.route('/')
  .get((req, res, next) => {
    Leader.find({})
      .then((leaders) => {
        console.log('All Leaders returned ', leaders);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
      }, err => next(err))
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    Leader.create(req.body)
      .then((leader) => {
        console.log('Leader Created ', leader);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
      }, err => next(err))
      .catch(err => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /leaders');
  })
  .delete((req, res, next) => {
    Leader.remove({})
      .then((resp) => {
        console.log('All leaders removed ', resp);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, err => next(err))
      .catch(err => next(err));
  });

router.route('/:leaderId')
  .get((req, res, next) => {
    Leader.findById(req.params.leaderId)
      .then((leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
      }, err => next(err))
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /leaders/${req.params.leaderId}`);
  })
  .put((req, res, next) => {
    Leader.findByIdAndUpdate(req.params.leaderId, {
      $set: req.body,
    }, { new: true })
      .then((leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
      }, err => next(err))
      .catch(err => next(err));
  })
  .delete((req, res, next) => {
    Leader.findByIdAndRemove(req.params.leaderId)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, err => next(err))
      .catch(err => next(err));
  });

module.exports = router;


// PREVIOUS EXERCISE
// leaderRouter.route('/')
//   .all((req, res, next) => {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     next();
//   })

//   .get((req, res, next) => {
//     res.end('Will send all the leaders to you!');
//   })

//   .post((req, res, next) => {
//     res.end(`Will add the leader: ${req.body.name} with details: ${req.body.description}`);
//   })

//   .put((req, res, next) => {
//     res.statusCode = 403;
//     res.end('PUT operation no supported on /leaders');
//   })

//   .delete((req, res, next) => {
//     res.end('Deleting all leaders');
//   });

// // Handle the '/:leaderId' path
// leaderRouter.route('/:leaderId')
//   .all((req, res, next) => {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     next();
//   })

//   .get((req, res, next) => {
//     res.end(`Will send details of the leader: ${req.params.leaderId} to you!`);
//   })
//   .post((req, res, next) => {
//     res.statusCode = 403;
//     res.end(`POST operation no supported on /leaders/${req.params.leaderId}`);
//   })
//   .put((req, res, next) => {
//     res.write(`Updating the leader: ${req.params.leaderId}\n`);
//     res.end(`Will update the leader: ${req.body.name
//     } with details: ${req.body.description}`);
//   })
//   .delete((req, res, next) => {
//     res.end(`Deleting leader: ${req.params.leaderId}`);
//   });

// explicitly declare all the end points - handle each one of them independently
