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
        if (parte !== '1' && parte !== '9') {
            idFormulario = formulario.idFormulario;
            await FormulariosMongo.acrescentar(idFormulario, formulario);
        }
        else {
            idFormulario = await FormulariosMongo.inserir(formulario);
        }
        if (Number.parseInt(parte) + 1 === 8) {
            const formularioCompleto = await FormulariosMongo.buscarPorId(idFormulario);
            if (formularioCompleto) {
                delete formularioCompleto.parte;
                delete formularioCompleto.idFormulario;
                await FormulariosMongo.atualizar(idFormulario, formularioCompleto);
            }
            res.status(200).redirect('/agradecimento');
        }
        res.status(201).render(`formulario${Number.parseInt(parte) + 1}`, { title: 'Formulário', idFormulario });
    } catch (error) {
        res.status(500).json({ error: "Erro ao inserir formulário." });
    }
};

exports.exibirGraficos = async (req, res) => {
    try {
        await FormulariosMongo.removerRespostasIncompletas();
        await FormulariosMongo.apararRespostas();

        const formularios = await FormulariosMongo.listarTodos();

        function contar(campo) {
            const contagem = {};
            formularios.forEach(f => {
                if (f[campo]) {
                    contagem[f[campo]] = (contagem[f[campo]] || 0) + 1;
                }
            });
            return contagem;
        }

        const equipe = contar("avaliacao_equipe");
        const limpeza = contar("avaliacao_limpeza");
        const tempo = contar("avaliacao_tempo");

        res.render("graficos", {
            title: 'Gráficos',
            equipe: JSON.stringify(equipe),
            limpeza: JSON.stringify(limpeza),
            tempo: JSON.stringify(tempo)
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Erro ao gerar gráficos.");
    }
};
