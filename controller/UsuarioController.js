const UsuarioMongo = require("../model/UsuarioMongo");

exports.registro = async (req, res) => {
    try {
        let hash_empresa = "e3c1b9f4c8d7a22fb6e4d0c915f72b0f8d9a3ea0b1c24f0c6e5a8d3f7b91c42e";
        const usuario = req.body;
        if(usuario.hash !== hash_empresa){
            return res.status(400).json({ erro: "Hash da empresa inválido." });
        }
        await UsuarioMongo.registro(usuario);
        res.status(201).json({ mensagem: "Usuário registrado com sucesso." });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao registrar usuário." });
    }
};

exports.login = async (req, res) => {
    try {
        const usuario = req.body;
        const usuarioEncontrado = await UsuarioMongo.login(usuario);
        if (!usuarioEncontrado) {
            return res.status(401).json({ erro: "Credenciais inválidas." });
        }
        res.status(200).json({ mensagem: "Login bem-sucedido.", usuario: usuarioEncontrado });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao fazer login." });
    }
};