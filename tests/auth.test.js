const test = require('node:test');
const assert = require('node:assert/strict');

const { initDatabase, registerUser, loginUser } = require('../src/services/auth.service');

(async () => {
  test('registerUser guarda un usuario y loginUser valida la contraseña', async () => {
    const dbPath = ':memory:';
    await initDatabase(dbPath);

    const user = await registerUser({
      name: 'Ana',
      email: 'ana@ejemplo.com',
      password: 'PruebaSegura1!',
      role: 'student',
      teamName: 'Los Halcones'
    }, dbPath);

    assert.equal(user.name, 'Ana');
    assert.equal(user.role, 'student');
    assert.ok(user.id > 0);

    const sessionUser = await loginUser({
      email: 'ana@ejemplo.com',
      password: 'PruebaSegura1!',
      role: 'capitan'
    }, dbPath);

    assert.equal(sessionUser.email, 'ana@ejemplo.com');
    assert.equal(sessionUser.role, 'student');
  });

  test('loginUser infiere el rol desde la cuenta registrada', async () => {
    const dbPath = ':memory:';
    await initDatabase(dbPath);

    await registerUser({
      name: 'Admin Test',
      email: 'admin@ejemplo.com',
      password: 'PruebaSegura1!',
      role: 'admin'
    }, dbPath);

    const sessionUser = await loginUser({
      email: 'admin@ejemplo.com',
      password: 'PruebaSegura1!'
    }, dbPath);

    assert.equal(sessionUser.role, 'admin');
  });
})();
