import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_for_development', {
        expiresIn: '30d',
    });
};

export default generateToken;
