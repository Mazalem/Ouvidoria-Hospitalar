exports.index = async function(req, res){
    res.render('index', { title: 'Home' });
}

exports.login = async function(req, res){
    res.render('login', { title: 'Home' });
}

exports.registro = async function(req, res){
    res.render('registro', { title: 'Home' });
}

exports.dashboard = async function(req, res){
    res.render('dashboard', { title: 'Home' });
}