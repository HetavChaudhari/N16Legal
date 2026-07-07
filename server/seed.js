const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Lawyer = require('./models/Lawyer');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing test users
        await User.deleteMany({ email: { $in: ['admin@n16legal.com', 'lawyer@n16legal.com', 'client@n16legal.com', 'receptionist@n16legal.com'] } });

        // Admin User
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@n16legal.com',
            password: 'password123',
            role: 'admin',
            phone: '1234567890'
        });

        // Lawyer User
        const lawyer = await User.create({
            name: 'John Doe (Lawyer)',
            email: 'lawyer@n16legal.com',
            password: 'password123',
            role: 'lawyer',
            phone: '0987654321'
        });

        // Create Lawyer Profile
        await Lawyer.create({
            user: lawyer._id,
            specialization: ['Corporate Law', 'Family Law'],
            experience: 10,
            education: 'Harvard Law School',
            consultationFee: 150,
            verified: true
        });

        // Receptionist User
        await User.create({
            name: 'Rita Front-Desk (Receptionist)',
            email: 'receptionist@n16legal.com',
            password: 'password123',
            role: 'receptionist',
            phone: '5556667777'
        });

        // Client User
        const client = await User.create({
            name: 'Jane Smith (Client)',
            email: 'client@n16legal.com',
            password: 'password123',
            role: 'client',
            phone: '1112223333'
        });

        console.log('Test accounts successfully seeded!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
