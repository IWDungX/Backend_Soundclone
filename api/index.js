const { Router } = require('express');
const router = Router();


// Route mẫu để kiểm tra
router.use('/login', require('./client/login'));
router.use('/playlist', require('./client/playlist'));
router.use('/register', require('./client/register'));
router.use('/verify', require('./client/verify'));
router.use('/songs', require('./client/songs'));

router.use('/authAdmin', require('./admin/authAdmin'));

module.exports = router;