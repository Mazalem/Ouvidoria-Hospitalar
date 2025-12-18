const FormulariosMongo = require("../model/FormularioMongo");
const UsuarioMongo = require("../model/UsuarioMongo");

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
        const usuario = req.body;
        const usuarioEncontrado = await UsuarioMongo.login(usuario);
        
        if (!usuarioEncontrado) {
            return res.render("login", { 
                erro: "E-mail ou senha incorretos.",
                emailDigitado: usuario.email,
                title: 'Login'
            });
        }
        
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

        function contarArray(campo) {
            const contagem = {};
            formularios.forEach(f => {
                if (Array.isArray(f[campo])) {
                    f[campo].forEach(item => {
                        contagem[item] = (contagem[item] || 0) + 1;
                    });
                }
            });
            return contagem;
        }

        function contarEscala(campo) {
            const labels = ["1", "2", "3", "4", "5"];
            const data = [0, 0, 0, 0, 0];
            formularios.forEach(f => {
                const val = parseInt(f[campo]);
                if (val >= 1 && val <= 5) data[val - 1]++;
            });
            return { labels, data };
        }

        function contarNPSDistribucao() {
            const labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
            const data = Array(11).fill(0);
            formularios.forEach(f => {
                if (f.nps !== undefined) {
                    const nota = parseInt(f.nps);
                    if (nota >= 0 && nota <= 10) data[nota]++;
                }
            });
            return { labels, data };
        }

        let promotores = 0, detratores = 0, totalNPS = 0;
        formularios.forEach(f => {
            if (f.nps !== undefined) {
                totalNPS++;
                const nota = parseInt(f.nps);
                if (nota >= 9) promotores++;
                else if (nota <= 6) detratores++;
            }
        });

        const npsFinal = totalNPS > 0 ? Math.round(((promotores - detratores) / totalNPS) * 100) : 0;
        const npsColor = npsFinal > 50 ? "bg-success" : (npsFinal < 0 ? "bg-danger" : "bg-warning");

        res.render("graficos", {
            title: 'Dashboard HDS/PAM',
            stats: {
                total: formularios.length,
                nps: npsFinal,
                npsColor,
                promotores: Math.round((promotores / totalNPS) * 100 || 0),
                detratores: Math.round((detratores / totalNPS) * 100 || 0),
                pacientes: formularios.filter(f => f.perfil_usuario === 'Paciente').length
            },
            dados: {
                unidade: JSON.stringify(contar("unidade")),
                cidade: JSON.stringify(contar("cidade")),
                procurou_psf: JSON.stringify(contar("procurou_psf")),
                motivo_psf: JSON.stringify(contarArray("motivo_nao_psf")),
                nome_psf: JSON.stringify(contar("nome_psf")),
                perfil: JSON.stringify(contar("perfil_usuario")),
                sexo: JSON.stringify(contar("sexo")),
                renda: JSON.stringify(contar("renda_familiar")),
                tempo: JSON.stringify(contarEscala("tempo_espera")),
                agilidade: JSON.stringify(contarEscala("agilidade")),
                limpeza: JSON.stringify(contarEscala("limpeza")),
                sinalizacao: JSON.stringify(contarEscala("sinalizacao")),
                recepcao: JSON.stringify(contarEscala("recepcao")),
                equipe: JSON.stringify(contarEscala("equipe")),
                seguranca: JSON.stringify(contarEscala("seguranca")),
                informacoes: JSON.stringify(contarEscala("informacoes")),
                nps_dist: JSON.stringify(contarNPSDistribucao()),
                reclamar: JSON.stringify(contar("sabe_reclamar")),
                pagou: JSON.stringify(contar("pagou_valor")),
                profissional: JSON.stringify(contar("nome_profissional")),
                internado: JSON.stringify(contar("internado")),
                dias: JSON.stringify(contar("dias_internacao")),
                roupas: JSON.stringify(contarEscala("limpeza_roupas")),
                alimentacao: JSON.stringify(contarEscala("alimentacao_paciente")),
                visitas: JSON.stringify(contarEscala("tempo_visitas"))
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Erro ao gerar gráficos.");
    }
};