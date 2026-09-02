const express = require('express');
const categoryController = require('../controllers/categoryController');
const validate = require('../middleware/validate');
const { categoryValidators } = require('../validators/otherValidators');

const router = express.Router();

router.get('/', categoryController.list);
router.post('/', validate(categoryValidators.create), categoryController.create);

module.exports = router;
