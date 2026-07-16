require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

const doctors = [
  { name: 'Dr. Anil Sharma', email: 'anil@clinic.test', password: 'password123', role: 'doctor', specialization: 'General Physician' },
  { name: 'Dr. Priya Karki', email: 'priya@clinic.test', password: 'password123', role: 'doctor', specialization: 'Pediatrics' },
  { name: 'Dr. Sunita Rai', email: 'sunita@clinic.test', password: 'password123', role: 'doctor', specialization: 'Gynecology' },
  { name: 'Dr. Bikash Thapa', email: 'bikash@clinic.test', password: 'password123', role: 'doctor', specialization: 'Orthopedics' },
  { name: 'Dr. Nisha Gurung', email: 'nisha@clinic.test', password: 'password123', role: 'doctor', specialization: 'Dermatology' },
];

async function run() {
  await connectDB();

  for (const doc of doctors) {
    const existing = await User.findOne({ email: doc.email });
    if (existing) {
      console.log(`Skipping ${doc.email} (already exists)`);
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    await User.create(doc);
    console.log(`Created: ${doc.name} (${doc.email})`);
  }

  console.log('\nDone. All doctor passwords are "password123".');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});