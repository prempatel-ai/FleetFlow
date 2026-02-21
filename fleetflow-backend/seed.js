const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const seed = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const demoEmail = 'manager@fleet.com';
        const userExists = await User.findOne({ email: demoEmail });

        if (!userExists) {
            await User.create({
                name: 'Prem Patel',
                email: demoEmail,
                password: 'password123',
                role: 'Manager'
            });
            console.log('✅ Demo account created: manager@fleet.com / password123');
        } else {
            console.log('ℹ️ Demo account already exists.');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seed();
