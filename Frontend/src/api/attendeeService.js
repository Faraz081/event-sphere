import api from "./api";

/**
 * Service methods for Admin Attendee Management
 */

// Fetch all attendees with optional search and filters
export const fetchAttendees = async (params = {}) => {
  const response = await api.get("/api/attendees", { params });
  return response.data;
};

// Fetch attendee status and pass statistics
export const fetchAttendeeStats = async () => {
  const response = await api.get("/api/attendees/stats");
  return response.data;
};

// Fetch a single attendee record by ID
export const fetchAttendeeById = async (id) => {
  const response = await api.get(`/api/attendees/${id}`);
  return response.data;
};

// Create / register an attendee
export const createAttendee = async (attendeeData) => {
  const response = await api.post("/api/attendees", attendeeData);
  return response.data;
};

// Update an existing attendee record
export const updateAttendee = async (id, attendeeData) => {
  const response = await api.put(`/api/attendees/${id}`, attendeeData);
  return response.data;
};

// Delete / remove an attendee registration
export const deleteAttendee = async (id) => {
  const response = await api.delete(`/api/attendees/${id}`);
  return response.data;
};
