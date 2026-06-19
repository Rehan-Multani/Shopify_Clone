import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    // Note: ensure JWT_SECRET is added to .env
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_for_development', {
        expiresIn: '30d',
    });
};

export default generateToken;
