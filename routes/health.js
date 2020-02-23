const router = require('express').Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Check status
 */

/**
 * @swagger
 * path:
 *  /health/:
 *    get:
 *      summary: Get health status
 *      tags: [Health]
 *      responses:
 *        '200':
 *          description: Health status of service
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Service is healthy
 *                  date:
 *                    type: string
 *                    example: 2020-02-23T10:07:12.107Z
 */
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Service is healthy', date: new Date() });
});

module.exports = router;
