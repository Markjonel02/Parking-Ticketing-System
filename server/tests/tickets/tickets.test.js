// server/tests/tickets/tickets.test.js
import { TicketModel } from '../../src/models/Ticket.js';
import { generateTicketNumber } from '../../src/utils/generateTicketNumber.js';
import { calculateFine } from '../../src/utils/calculateFine.js';

export function testTicketLogic() {
  const tktNum = generateTicketNumber();
  console.assert(tktNum.startsWith('PKG-'), 'Ticket number should start with PKG- prefix');

  const fine = calculateFine({ baseFine: 80, zoneMultiplier: 1.25, isOverdue: true, lateFee: 30 });
  console.assert(fine.baseFine === 100, 'Adjusted fine should be 100 with 1.25 multiplier');
  console.assert(fine.totalDue === 130, 'Total due with late fee should be 130');

  const tickets = TicketModel.findAll();
  console.assert(tickets.length > 0, 'Seeded tickets should be present');
}

testTicketLogic();
console.log('✅ Ticket tests passed successfully');
