import api from "./api";




export const fetchAttendees = async (params = {}) => {
  const response = await api.get("/api/attendees", { params });
  return response.data;
};


export const fetchAttendeeStats = async () => {
  const response = await api.get("/api/attendees/stats");
  return response.data;
};


export const fetchAttendeeById = async (id) => {
  const response = await api.get(`/api/attendees/${id}`);
  return response.data;
};


export const createAttendee = async (attendeeData) => {
  const response = await api.post("/api/attendees", attendeeData);
  return response.data;
};


export const updateAttendee = async (id, attendeeData) => {
  const response = await api.put(`/api/attendees/${id}`, attendeeData);
  return response.data;
};


export const deleteAttendee = async (id) => {
  const response = await api.delete(`/api/attendees/${id}`);
  return response.data;
};
