const { registerUser, loginUser } = require('../services/auth.service');

function renderAuthPage(res, viewName, title, viewData = {}) {
  res.status(viewData.error ? 400 : 200).render(viewName, {
    title,
    error: viewData.error || null,
    formData: viewData.formData || {},
    success: viewData.success || null
  });
}

async function register(req, res) {
  try {
    if (req.body.password !== req.body.confirmPassword) {
      throw new Error('Las contraseñas no coinciden.');
    }

    const user = await registerUser({
      name: req.body.nombre,
      email: req.body.email,
      password: req.body.password
    });

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return res.redirect('/');
  } catch (error) {
    return renderAuthPage(res, 'register', 'Registro | Interclases LJV', {
      error: error.message,
      formData: req.body
    });
  }
}

async function login(req, res) {
  try {
    const user = await loginUser({
      email: req.body.email,
      password: req.body.password
    });

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return res.redirect('/');
  } catch (error) {
    return renderAuthPage(res, 'login', 'Iniciar sesión | Interclases LJV', {
      error: error.message,
      formData: req.body
    });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}

module.exports = {
  register,
  login,
  logout
};
