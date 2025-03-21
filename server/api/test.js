const { Router } = require('express');
const { User } = require('../models');

const userRouter = Router();

userRouter.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['user_id', 'user_email', 'user_name', 'user_created_at']
        });
        return res.json(users);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ errorMessage: 'Internal Server Error' });
    }
});

module.exports = userRouter;
