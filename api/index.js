const { Router } = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const router = Router();

// Public routes
const publicRouter = Router();
publicRouter.use('/login', require('./login'));
publicRouter.use('/register', require('./register'));
publicRouter.use('/verify', require('./verify'));
publicRouter.use('/verify-token', require('./verifyToken'));
publicRouter.use('/admin/auth', require('./admin/authAdmin'));
publicRouter.use('/password', require('./password'));

// Protected routes
const protectedRouter = Router();
protectedRouter.use(verifyToken); 
protectedRouter.use('/playlists', require('./playlist'));
protectedRouter.use('/songs', require('./songs'));
protectedRouter.use('/artist', require('./artist'));
protectedRouter.use('/users', require('./users'));
protectedRouter.use('/search', require('./search'));
protectedRouter.use('/history', require('./history'));
// Admin routesroutes
const adminRouter = Router();
adminRouter.use([verifyToken, checkRole('admin')]); 
adminRouter.use('/songs', require('./admin/song'));
adminRouter.use('/artists', require('./admin/artists'));
adminRouter.use('/users', require('./admin/user'));

router.use(publicRouter);
router.use(protectedRouter);
router.use('/admin', adminRouter);

module.exports = router;