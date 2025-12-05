var express = require('express');
var router = express.Router();
var IndexController = require('../controller/IndexController');

router.get('/', IndexController.index);
router.get('/login', IndexController.login);
router.get('/registro', IndexController.registro);
router.get('/agradecimento', IndexController.agradecimento);

module.exports = router;