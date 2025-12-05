require("dotenv").config();
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

        const camposObrigatorios = [
            "unidade",
            "procurou_psf",
            "perfil_usuario",
            "avaliacao_tempo",
            "nps"
        ];
        const incompletos = await collection.find({
            $or: camposObrigatorios.map(campo => ({ [campo]: { $exists: false } }))
        }).toArray();

        if (incompletos.length > 0) {
            const ids = incompletos.map(doc => doc._id);

            await collection.deleteMany({
                _id: { $in: ids }
            });
        } else {
            console.log("Nenhum formulário incompleto encontrado.");
        }
    }



}
module.exports = new FormularioMongo();
