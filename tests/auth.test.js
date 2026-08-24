const test = require('node:test');
const assert = require('node:assert/strict');

const { initDatabase, registerUser, loginUser } = require('../src/services/auth.service');

(async () => {
  test('registerUser guarda un usuario y loginUser valida la contraseña', async () => {
    const dbPath = ':memory:';
    initDatabase(dbPath);

    const user = await registerUser({
      name: 'Ana',
      email: 'ana@ejemplo.com',
      password: '123456'
    }, dbPath);

    assert.equal(user.name, 'Ana');
    assert.ok(user.id > 0);

    const sessionUser = await loginUser({
      email: 'ana@ejemplo.com',
      password: '123456'
    }, dbPath);

    assert.equal(sessionUser.email, 'ana@ejemplo.com');
  });
})();
