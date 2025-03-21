const { Router } = require('express');
const router = Router();


// Route mẫu để kiểm tra
router.use('/login', require('./login'));
router.use('/playlist', require('./playlist'));
router.use('/register', require('./register'));
router.use('/verify', require('./verify'));
router.use('/songs', require('./songs'));

module.exports = router;