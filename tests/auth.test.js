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
      password: '123456',
      role: 'capitan',
      teamName: 'Los Halcones'
    }, dbPath);

    assert.equal(user.name, 'Ana');
    assert.equal(user.role, 'capitan');
    assert.ok(user.id > 0);

    const sessionUser = await loginUser({
      email: 'ana@ejemplo.com',
      password: '123456',
      role: 'capitan'
    }, dbPath);

    assert.equal(sessionUser.email, 'ana@ejemplo.com');
    assert.equal(sessionUser.role, 'capitan');
  });

  test('loginUser infiere el rol desde la cuenta registrada', async () => {
    const dbPath = ':memory:';
    await initDatabase(dbPath);

    await registerUser({
      name: 'Admin Test',
      email: 'admin@ejemplo.com',
      password: '123456',
      role: 'admin'
    }, dbPath);

    const sessionUser = await loginUser({
      email: 'admin@ejemplo.com',
      password: '123456'
    }, dbPath);

    assert.equal(sessionUser.role, 'admin');
  });
})();
