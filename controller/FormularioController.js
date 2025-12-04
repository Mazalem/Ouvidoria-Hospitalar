const FormulariosMongo = require("../model/FormularioMongo");

exports.listarFormularios = async (req, res) => {
    try {
        const formularios = await FormulariosMongo.listarTodos();
        res.status(200).json(formularios);
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar formulários." });
    }
};

exports.inserirFormulario = async (req, res) => {
    try {
        const formulario = req.body;
        let idFormulario = null;
        let parte = formulario.parte;
        if (parte !== '1' && parte !== '8') {
            idFormulario = formulario.idFormulario;
            await FormulariosMongo.acrescentar(idFormulario, formulario);
        }
        else {
            idFormulario = await FormulariosMongo.inserir(formulario);
        }
        if (Number.parseInt(parte) + 1 === 8){
            res.status(200).redirect('/agradecimento');
        }
        res.status(201).render(`formulario${Number.parseInt(parte) + 1}`, { title: 'Formulário', idFormulario });
    } catch (error) {
        res.status(500).json({ error: "Erro ao inserir formulário." });
    }
};