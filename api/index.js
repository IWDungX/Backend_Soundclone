const { Router } = require('express');
const router = Router();


router.use('/login', require('./login'));
router.use('/playlist', require('./playlist'));
router.use('/register', require('./register'));
router.use('/verify', require('./verify'));
router.use('/songs', require('./songs'));
router.use('/artist', require('./artist'));

router.use('/authAdmin', require('./authAdmin'));

module.exports = router;