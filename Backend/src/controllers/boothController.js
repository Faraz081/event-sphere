import Booth from "../models/Booth.js";

const createBooth = async (req, res) => {
  try {
    const { expo, boothNumber, size, price, status, exhibitor, location } = req.body;
    if(!expo || !boothNumber){
        return res.status(400).json({error:"Expo and booth number are required"})
    }
    const addBooth = await Booth.create({ expo, boothNumber, size, price, status, exhibitor, location })
    return res.status(201).json({msg:"Booth created successfully", addBooth})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

export {createBooth}