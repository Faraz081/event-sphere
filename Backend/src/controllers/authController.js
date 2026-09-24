import User from "../models/User.js";
import bcrypt from 'bcrypt';

const login = async (req, res) => {
  try {
    const {email, password}= req.body

    if(!email || !password){
        return res.status(400).json({msg:"Email and password are required"})
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        return res.status(400).json({msg:"Please enter a valid email"})
    }

    const check= await User.findOne({email}).select("+password")

    if(check){
        var checkPassword = await bcrypt.compare(password, check.password)

        if(!checkPassword){
            return res.status(401).json({error:"Password or Email is incorrect"})
        } else{
            check.password = undefined
            return res.status(200).json({msg:"User login successfully", user: check})
        }
    } else{
        return res.status(404).json({msg:"User not found"})
    }
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, companyName, phone } = req.body;

    if(!name || !email || !password || !confirmPassword || !role || !phone){
        return res.status(400).json({msg:"All fields are required"})
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        return res.status(400).json({msg:"Please enter a valid email"})
    }

    if(password !== confirmPassword){
        return res.status(400).json({msg:"Passwords do not match"})
    }

    if(!/^\d{11}$/.test(phone)){
        return res.status(400).json({msg:"Phone number must contain exactly 11 digits"})
    }

    if(!["admin", "exhibitor", "attendee"].includes(role)){
        return res.status(400).json({msg:"Invalid role"})
    }

    const oldUsers = await User.findOne({email})

    if(oldUsers){
        return res.status(409).json({error:"This email is already registered"})
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const addUser = await User.create({ name, email, password:hashedPassword, role, companyName, phone });

    addUser.password = undefined

    res.status(201).json({msg:"registered", addUser });
  } catch (error) {
    res.status(500).json({error: error.message });
  }
};

export {login, register}