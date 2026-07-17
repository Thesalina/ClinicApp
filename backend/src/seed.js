require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const users = [
  { name: 'Reeta Shrestha', email: 'reception@clinic.test', password: 'password123', role: 'receptionist' },
  { name: 'Dr. Anil Sharma', email: 'anil@clinic.test', password: 'password123', role: 'doctor', specialization: 'General Physician' },
  { name: 'Dr. Priya Karki', email: 'priya@clinic.test', password: 'password123', role: 'doctor', specialization: 'Pediatrics' },
  { name: 'Dr. Sunita Rai', email: 'sunita@clinic.test', password: 'password123', role: 'doctor', specialization: 'Gynecology' },
  { name: 'Dr. Bikash Thapa', email: 'bikash@clinic.test', password: 'password123', role: 'doctor', specialization: 'Orthopedics' },
  { name: 'Dr. Nisha Gurung', email: 'nisha@clinic.test', password: 'password123', role: 'doctor', specialization: 'Dermatology' },
];

async function run() {
  await connectDB();

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`Skipping ${u.email} (already exists)`);
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    await User.create(u);
    console.log(`Created ${u.role}: ${u.name} (${u.email})`);
  }

  console.log('\nDone. All account passwords are "password123".');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});