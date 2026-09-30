import Event from "../models/Event.js";
import Booth from "../models/Booth.js";

const createEvent = async (req, res) => {
  try {
    const exhibitor = req.user.userId;
    const { title, description, date, banner } = req.body;
    if(!title || !description || !date){
        return res.status(400).json({error:"Title, description and date are required"})
    }
    const booth = await Booth.findOne({exhibitor, status:"reserved"})
    if(!booth){
        return res.status(403).json({error:"You must have an approved booth to create an event"})
    }
    const event = await Event.create({expo: booth.expo, booth: booth._id, exhibitor, title, description, date, banner})
    return res.status(201).json({msg:"Event created successfully", event})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

const getMyEvents = async (req, res) => {
  try {
    const exhibitor = req.user.userId;
    const events = await Event.find({exhibitor}).sort({date: 1})
    return res.status(200).json({msg:"Events fetched", events})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("exhibitor", "name companyName").sort({date: 1})
    return res.status(200).json({msg:"All events fetched", events})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const exhibitor = req.user.userId;
    const event = await Event.findOneAndDelete({_id:id, exhibitor})
    if(!event){
        return res.status(404).json({error:"Event not found or not yours"})
    }
    return res.status(200).json({msg:"Event deleted successfully"})
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

export {createEvent, getMyEvents, getAllEvents, deleteEvent}