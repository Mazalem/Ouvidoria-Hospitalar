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

class UsuarioMongo {
    async close() {
        if (cliente) cliente.close();
        cliente = undefined;
    }

    async listarTodos() {
        await conexao_bd();
        const collection = bd().collection("usuario");
        return await collection.find().toArray();
    }

    async registro(usuario) {
        await conexao_bd();
        const collection = bd().collection("usuario");
        await collection.insertOne(usuario);
    }

    async login(usuario) {
        await conexao_bd();
        const collection = bd().collection("usuario");
        return await collection.findOne({ email: usuario.email, senha: usuario.senha });
    }

}
module.exports = new UsuarioMongo();