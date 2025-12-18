exports.index = async function(req, res){
    res.render('index', { title: 'Home' });
}

exports.login = async function(req, res){
    res.render('login', { title: 'Login' });
}

exports.registro = async function(req, res){
    res.render('registro', { title: 'Home' });
}

exports.agradecimento = async function(req, res){
    res.render('agradecimento', { title: 'Home' });
}

exports.consentimento = async function(req, res){
    res.render('consentimento', { title: 'Home' });
}