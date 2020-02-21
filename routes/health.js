const router = require('express').Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Service is healthy' });
});

module.exports = router;
