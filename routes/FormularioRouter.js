var express = require('express');
var router = express.Router();
var FormularioController = require('../controller/FormularioController');

router.get('/listar', FormularioController.listarFormularios);
router.post('/inserir', FormularioController.inserirFormulario);

module.exports = router;