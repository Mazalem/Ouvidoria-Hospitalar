var express = require('express');
var router = express.Router();
var UsuarioController = require('../controller/UsuarioController');

router.post('/registro', UsuarioController.registro);
router.post('/login', UsuarioController.login);

module.exports = router;