const express = require('express')
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const router = express.Router();
const Error = require('../utils/error.js');

router.post("/signup", async (req, res) => {
    const { username, password, email, role } = req.body

    try {
        if (!username || !password || !email) {
            res.status(500).json("please enter all fields")
        }
        else {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            const verificationToken = crypto.randomBytes(32).toString('hex');

            const newUser = new User({
                username,
                email:email.toLowerCase(),
                password: hash,
                role,
                verificationToken,
            })
            await newUser.save();

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'dushyantgarg37@gmail.com',
                    pass: 'rjbg mcaf tagb htue' 
                }
            });

            const mailOptions = {
                from: 'dushyantgarg37@gmail.com',
                to: newUser.email,
                subject: 'Email Verification',
                text: `Please verify your email by clicking the link: \nhttp://${req.headers.host}/auth/verify-email?token=${verificationToken}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send('Error sending email');
                } else {
                    console.log('Email sent: ' + info.response);
                    res.status(200).send('Signup successful! Please check your email to verify your account.');
                }
            });

            // res.redirect("/auth/signin");
        }
    } catch (err) {
        res.status(500).send(err);
    }
})

router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send('Invalid token');
        }

        const user = await User.findOne({ 
            verificationToken: token, 
        });

        if (!user) {
            return res.status(400).send('Invalid or expired token');
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.redirect("/auth/signin")
        
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post("/signin", async (req, res) => {
    const { username, password } = req.body
    try {
        if (!username || !password) {
            throw new Error("Payload is not valid",null, 400);
        }
            const existUser = await User.findOne({ username })
            if (!existUser) {
                throw new Error("")
                // return res.status(500).json("Wrong username or password entered")
            }
            const isPasswordCorrect = await bcrypt.compare(
                password, existUser.password
            );
            if (!isPasswordCorrect) {
                return res.status(500).json("Wrong username or password entered");
            }
            req.session.isLoggedIn = true
            req.session.userId = existUser._id

            res.redirect("/")
    } catch (error) {
        if (error instanceof Error) {
            return res.status(error.statusCode).json({error: error?.frontendMessage ?? error?.message})
        }
        return res.status(500).json('Something went wrong.');
    }
})

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('No user found with that email');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        user.passwordResetToken = resetToken;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'dushyantgarg37@gmail.com',
                pass: 'rjbg mcaf tagb htue'
            }
        });

        const mailOptions = {
            from: 'dushyantgarg37@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            text: `Please reset your password by clicking the link: \nhttp://${req.headers.host}/auth/reset-password?token=${resetToken}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error sending email');
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).send('Password reset email sent! Please check your email.');
            }
        });

    } catch (err) {
        res.status(500).send(err);
    }
})

router.get('/reset-password', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('Invalid token');
    }

    res.render(path.join(__dirname, "..", "public", "resetPassword.ejs"), {
                    token: token,
                })
})

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    

    try {
        const user = await User.findOne({
            passwordResetToken: token,
        });

        if (!user) {
            return res.status(400).send('Invalid or expired token');
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        user.password = hash;
        user.passwordResetToken = null;
        await user.save();
        res.redirect("/auth/signin")
        
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get("/logout", (req, res) => {
    console.log(req.session)
    try {
        req.session.isLoggedIn = false;
        req.session.userId = null;
        res.status(200).send("logout successful")
        
    } catch (error) {
        res.status(500).json(error);
    }
})

router.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "login.html"))
})

router.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "signup.html"))
})

router.get("/forgot-password", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "forgotPassword.html"))
})

module.exports = router