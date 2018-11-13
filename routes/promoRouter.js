const express = require('express');
const bodyParser = require('body-parser');

// add model
const Promotion = require('../models/promotions');

const router = express.Router();
router.use(bodyParser.json());

router.route('/')
  .get((req, res, next) => {
    Promotion.find({})
      .then((promos) => {
        console.log('All Promotions returned ', promos);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promos);
      }, err => next(err))
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    Promotion.create(req.body)
      .then((promo) => {
        console.log('Promotion Created ', promo);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
      }, err => next(err))
      .catch(err => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
  })
  .delete((req, res, next) => {
    Promotion.remove({})
      .then((resp) => {
        console.log('All promotions removed ', resp);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, err => next(err))
      .catch(err => next(err));
  });

router.route('/:promoId')
  .get((req, res, next) => {
    Promotion.findById(req.params.promoId)
      .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
      }, err => next(err))
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /promotions/${req.params.promoId}`);
  })
  .put((req, res, next) => {
    Promotion.findByIdAndUpdate(req.params.promoId, {
      $set: req.body,
    }, { new: true })
      .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
      }, err => next(err))
      .catch(err => next(err));
  })
  .delete((req, res, next) => {
    Promotion.findByIdAndRemove(req.params.promoId)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, err => next(err))
      .catch(err => next(err));
  });

module.exports = router;
