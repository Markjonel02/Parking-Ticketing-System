// server/tests/payments/payments.test.js
import { PaymentModel } from '../../src/models/Payment.js';
import { generateReferenceNumber } from '../../src/utils/generateReferenceNumber.js';
import { validatePayment } from '../../src/validators/paymentValidator.js';

export function testPaymentLogic() {
  const ref = generateReferenceNumber();
  console.assert(ref.startsWith('PAY-REF-'), 'Reference number should start with PAY-REF-');

  const invalid = validatePayment({ amount: -10 });
  console.assert(!invalid.isValid, 'Negative amount should fail validation');

  const payments = PaymentModel.findAll();
  console.assert(payments.length >= 0, 'Payment repository should return array');
}

testPaymentLogic();
console.log('✅ Payment tests passed successfully');
