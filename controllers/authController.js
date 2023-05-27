
const User = require('../models/userModel')
const bcrypt = require('bcryptjs')

exports.signup = async (req, res) => {

    const {username, password} = req.body
    
    try {
        const hashpassword = await bcrypt.hash(password, 12)
        const newUser = await User.create({
            username,
            password: hashpassword
        })
        req.session.user = newUser 
        res.status(201).json({
            status: 'success',
            data:{
                user: newUser
            }
        })
    } catch (error) {
        res.status(400).json({
            status:'fail'
        })
    }
}

exports.login = async (req, res) => {

    const {username, password} = req.body
    
    try {

        const user = await User.findOne({username})

        if(!user) {
            return res.status(400).json({
                status:'fail',
                message: 'user not found'
            })
        }

        const passwordMatched = await bcrypt.compare(password, user.password)

        if(passwordMatched) {
            req.session.user = user 
            res.status(200).json({
                status: 'success'
            })
        } else {
            res.status(201).json({
                status: 'fail',
                message: 'incorrect password'
            })
        }

    } catch (error) {
        res.status(400).json({
            status:'fail'
        })
    }
}