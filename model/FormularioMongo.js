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
}
module.exports = new FormularioMongo();
