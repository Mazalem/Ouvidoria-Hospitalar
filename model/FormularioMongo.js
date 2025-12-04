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

    async inserir(formulario) {
        await conexao_bd();
        const collection = bd().collection("formulario");
        await collection.insertOne(formulario);
    }

}
module.exports = new FormularioMongo();
