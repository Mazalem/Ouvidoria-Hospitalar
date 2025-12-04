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
        await FormulariosMongo.inserir(formulario);
        res.status(201).json({ message: "Formulário inserido com sucesso." });
    } catch (error) {
        res.status(500).json({ error: "Erro ao inserir formulário." });
    }
};