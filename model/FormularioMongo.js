require("dotenv").config();
const { ObjectId } = require('mongodb');
const mongodb = require("mongodb");

const ClienteMongo = mongodb.MongoClient;
var cliente;

const conexao_bd = async () => {
    if (!cliente)
        cliente = await ClienteMongo.connect(process.env.URL_BANCO);
};

const bd = () => {
    return cliente.db("ouvidoria_hospitalar");
};

class FormularioMongo {
    async close() {
        if (cliente) cliente.close();
        cliente = undefined;
    }

    async listarTodos() {
        await conexao_bd();
        const collection = bd().collection("formulario");
        return await collection.find().toArray();
    }

    async buscarPorId(idFormulario) {
        await conexao_bd();
        const collection = bd().collection("formulario");
        return await collection.findOne({ _id: new mongodb.ObjectId(idFormulario) });
    }

    async inserir(formulario) {
        await conexao_bd();
        const collection = bd().collection("formulario");
        const resultado = await collection.insertOne(formulario);
        return resultado.insertedId.toString();
    }

    async acrescentar(idFormulario, formulario) {
        await conexao_bd();
        const collection = bd().collection("formulario");
        await collection.findOneAndUpdate(
            { _id: new mongodb.ObjectId(idFormulario) },
            { $set: formulario }
        );
    }

    async atualizar(idFormulario, novoJson) {
        await conexao_bd();
        const collection = bd().collection("formulario");
        if ("_id" in novoJson) {
            delete novoJson._id;
        }
        await collection.replaceOne(
            { _id: new mongodb.ObjectId(idFormulario) },
            novoJson
        );
    }

    async removerRespostasIncompletas() {
        await conexao_bd();
        const collection = bd().collection("formulario");

        const umMinutoAtras = new Date(Date.now() - 60000);

        const camposObrigatorios = [
            "unidade",
            "procurou_psf",
            "perfil_usuario",
            "tempo_espera",
            "sabe_reclamar",
            "internado"
        ];

        const filtroIncompletos = {
            $or: [
                ...camposObrigatorios.map(campo => ({ [campo]: { $exists: false } })),
                { idFormulario: { $exists: true } },
                { parte: { $exists: true } }
            ]
        };

        const queryFinal = {
            $and: [
                filtroIncompletos,
                { _id: { $lt: ObjectId.createFromTime(Math.floor(umMinutoAtras.getTime() / 1000)) } }
            ]
        };

        const resultado = await collection.deleteMany(queryFinal);

        if (resultado.deletedCount > 0) {
            console.log(`${resultado.deletedCount} formulários incompletos ou temporários removidos.`);
        } else {
            console.log("Nenhum formulário para remover.");
        }
    }

    async apararRespostas() {
        await conexao_bd();
        const collection = bd().collection("formulario");

        const cursor = collection.find({});

        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            let camposParaRemover = {};

            if (doc.cidade !== "Divino") {
                camposParaRemover.zona = 1;
                camposParaRemover.bairro = 1;
                camposParaRemover.comunidade = 1;
            } else {
                if (doc.zona === "Urbana") camposParaRemover.comunidade = 1;
                else if (doc.zona === "Rural") camposParaRemover.bairro = 1;
            }

            if (doc.procurou_psf === "Sim") {
                camposParaRemover.motivo_nao_psf = 1;
                camposParaRemover.motivo_nao_psf_outro = 1;
            } else if (doc.procurou_psf === "Nao") {
                const motivos = doc.motivo_nao_psf || [];
                if (!motivos.includes("Outro")) camposParaRemover.motivo_nao_psf_outro = 1;
            }

            if (doc.pagou_valor === "Nao") {
                camposParaRemover.descricao_pagamento = 1;
            }

            if (doc.internado === "Nao") {
                camposParaRemover.dias_internacao = 1;
                camposParaRemover.limpeza_roupas = 1;
                camposParaRemover.alimentacao_paciente = 1;
                camposParaRemover.tempo_visitas = 1;
                camposParaRemover.teve_acompanhante = 1;
                camposParaRemover.livre_escolha = 1;
                camposParaRemover.alimentacao_acompanhante = 1;
                camposParaRemover.conforto_acompanhante = 1;
                camposParaRemover.motivo_sem_acompanhante = 1;
            } else {
                if (doc.teve_acompanhante === "Sim") {
                    camposParaRemover.motivo_sem_acompanhante = 1;
                } else if (doc.teve_acompanhante === "Nao") {
                    camposParaRemover.livre_escolha = 1;
                    camposParaRemover.alimentacao_acompanhante = 1;
                    camposParaRemover.conforto_acompanhante = 1;
                }
            }

            if (doc.deseja_contato === "Nao") {
                camposParaRemover.nome_contato = 1;
                camposParaRemover.telefone_contato = 1;
            }

            if (Object.keys(camposParaRemover).length > 0) {
                await collection.updateOne(
                    { _id: doc._id },
                    { $unset: camposParaRemover }
                );
            }
        }
    }
}
module.exports = new FormularioMongo();
