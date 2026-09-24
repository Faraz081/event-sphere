import Expo from "../models/Expo.js";

const createExpo = async (req, res) => {
  try {
    const { title, description, theme, date, location, status, banner, createdBy } = req.body;
    if(!title || !description || !date || !location || !createdBy){
        return res.status(400).json({error:"All fields are required"})
    }
    const addExpo= await Expo.create({title, description, theme, date, location, status, banner, createdBy})
    return res.status(201).json({msg:"Expo created successfully", addExpo})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

export {createExpo}