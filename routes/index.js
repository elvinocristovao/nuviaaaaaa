const express = require('express');
const router = express.Router();

const auth = require('./routes_auth');
const meals = require('./routes_food');
const profile = require('./routes_profile');
const webhook = require('./routes_webhook');

router.use('/auth', auth);
router.use('/meals', meals);
router.use('/profile', profile);
router.use('/webhook', webhook);

module.exports = router;
