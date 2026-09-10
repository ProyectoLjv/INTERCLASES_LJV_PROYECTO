function esAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/?error=Debes+iniciar+sesion+para+acceder+al+panel+privado');
  }

  if (req.session.user.role !== 'admin') {
    return res.redirect('/?error=No+tienes+permisos+para+acceder+al+panel+privado');
  }

  return next();
}

module.exports = { esAdmin };
