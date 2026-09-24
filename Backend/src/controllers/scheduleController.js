import Schedule from "../models/Schedule.js";

const createSchedule = async (req, res) => {
  try {
    const { expo, title, speaker, topic, location, startTime, endTime } = req.body;
    if(!expo || !title || !startTime || !endTime){
        return res.status(400).json({error:"Expo, title, start time and end time are required"})
    }
    const addSchedule = await Schedule.create({ expo, title, speaker, topic, location, startTime, endTime })
    return res.status(201).json({msg:"Schedule created successfully", addSchedule})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

export {createSchedule}