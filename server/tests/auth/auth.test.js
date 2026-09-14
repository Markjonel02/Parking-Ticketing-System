// server/tests/auth/auth.test.js
import { validateLogin } from '../../src/validators/authValidator.js';
import { UserModel } from '../../src/models/User.js';

export function testAuthValidation() {
  const empty = validateLogin({});
  console.assert(!empty.isValid, 'Empty login should fail validation');
  console.assert(empty.errors.email, 'Email error should be present');

  const valid = validateLogin({ email: 'admin@parkguard.gov', password: 'password123' });
  console.assert(valid.isValid, 'Valid credentials format should pass validation');

  const admin = UserModel.findByEmail('admin@parkguard.gov');
  console.assert(admin !== null, 'Admin user should be seeded');
  console.assert(admin.role === 'ADMIN', 'Admin user should have ADMIN role');
}

testAuthValidation();
console.log('✅ Auth tests passed successfully');
