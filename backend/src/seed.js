/**
 * seed.js
 * Populates the database with a few sample transcripts for testing.
 * Run: node src/seed.js  (from the backend folder, after setting .env)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Transcript = require('./models/Transcript');
const { generateVerificationHash } = require('./utils/signature');

const sampleStudents = [
  {
    registrationNumber: '2021/BSE/001/PS',
    studentName: 'Wembly Katumba',
    program: 'Bachelor of Science in Software Engineering',
    yearOfStudy: 3,
    gpa: 4.2
  },
  {
    registrationNumber: '2022/BSE/045/PS',
    studentName: 'Mugwanya Samuel',
    program: 'Bachelor of Science in Software Engineering',
    yearOfStudy: 2,
    gpa: 3.9
  },
  {
    registrationNumber: '2020/BSE/112/PS',
    studentName: 'Nakatudde Patricia',
    program: 'Bachelor of Science in Software Engineering',
    yearOfStudy: 4,
    gpa: 4.5
  }
];

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not set in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing sample data (optional – comment out if you want to keep existing records)
    await Transcript.deleteMany({
      registrationNumber: { $in: sampleStudents.map((s) => s.registrationNumber) }
    });

    const created = [];

    for (const student of sampleStudents) {
      const verificationHash = generateVerificationHash(student);
      const transcript = await Transcript.create({
        ...student,
        verificationHash,
        issuedBy: 'Academic Registrar (seed)'
      });
      created.push({
        registrationNumber: transcript.registrationNumber,
        studentName: transcript.studentName,
        verificationHash: transcript.verificationHash
      });
    }

    console.log('\nSeed completed. Sample transcripts:\n');
    created.forEach((t) => {
      console.log(`  ${t.registrationNumber}  |  ${t.studentName}`);
      console.log(`  Hash: ${t.verificationHash}\n`);
    });

    console.log('Use any of the hashes above with the matching registration number to test verification.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
