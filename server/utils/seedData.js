const mongoose = require('mongoose');
const Affirmation = require('../models/Affirmation');
require('dotenv').config();

const defaultAffirmations = [
  "I am very beautiful.",
  "I am healthy and full of energy.",
  "I am wealthy and financially abundant.",
  "Thank you for giving me a high-paying job that I love.",
  "Thank you for keeping my family healthy and safe.",
  "Thank you for keeping my friends healthy and happy.",
  "I do not hate anyone, and I release all grudges peacefully.",
  "I am mentally calm, peaceful, and balanced."
];

const seedAffirmations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing affirmations
    await Affirmation.deleteMany({});
    console.log('Cleared existing affirmations');

    // Create default affirmations
    const affirmations = defaultAffirmations.map((text, index) => ({
      text,
      order: index + 1,
      isActive: true,
      createdBy: new mongoose.Types.ObjectId() // Placeholder ID
    }));

    await Affirmation.insertMany(affirmations);
    console.log('✅ Default affirmations seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedAffirmations();
}

module.exports = { seedAffirmations };