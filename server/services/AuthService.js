const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserMongo, OTPMongo } = require('../models-mongo');

const JWT_SECRET = process.env.JWT_SECRET;

class AuthService {
    static async getUserByEmail(email) {
        return await UserMongo.findOne({ email });
    }

    static async getUserByUsername(username) {
        return await UserMongo.findOne({ username });
    }

    static async createOTP(email, otp, username, hashedPassword) {
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await OTPMongo.deleteMany({ email });
        return await OTPMongo.create({ email, otp, username, password: hashedPassword, expiresAt, verified: false });
    }

    static async verifyOTP(email, otp) {
        return await OTPMongo.findOne({ email, otp, verified: false }).sort({ createdAt: -1 });
    }

    static async createUser(payload) {
        return await UserMongo.create(payload);
    }

    static generateToken(user) {
        return jwt.sign(
            { id: user._id || user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
    }
}

module.exports = AuthService;
