const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Function to generate a JWT Token
async function generateToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                return reject(err);
            }
            resolve(token);
        });
    });
}


// Function to verify a JWT Token
async function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            resolve(decoded);
        });
    });
}

// Login to Application
async function login(req, res) {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Identifier and password are required.' });
        }

        console.log(identifier,password)
        const isNumeric = /^\d+$/.test(identifier.trim());
        const query = isNumeric
    ? { mobileNumber: parseInt(identifier.trim(), 10) } // Convert to integer for numeric input
    : { username: identifier.trim() };
        const findUser = await User.findOne({
            $or: [query],
        });

        console.log(findUser)

        if (!findUser) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isPasswordValid = await findUser.comparePassword(password);
        console.log(isPasswordValid)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        const token = await generateToken({ username: findUser.username });
        console.log(token)
        res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); // Use secure flag in production

        return res.status(200).json({
            message: 'Successfully Logged In',
            accessToken: token,
        });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred during login.' });
    }
}

// Register a User
async function createUser(req,res) {
    try {

        const user = new User({
            username: req.body?.username?.trim(),
            email: req.body?.email.trim(),
            password: req.body?.password.trim(),
            name:req.body?.name?.trim(),
            mobileNumber:req.body?.mobileNumber?.trim(),
            designation:req.body?.designation.trim()
        });

        await user.save();
        console.log(user)
       res.status(200).json({message:"Created Successfully",data:user})
    } catch (err) {
        console.log(err)
        res.status(500).json({message:err})
    }
}


module.exports = {
    generateToken,
    verifyToken,
    login,
    createUser
};