const express = require('express');
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const { userValidators } = require('../validators/otherValidators');

const router = express.Router();

router.get('/', userController.list);
router.post('/', validate(userValidators.create), userController.create);
router.get('/:id', userController.getById);

module.exports = router;
