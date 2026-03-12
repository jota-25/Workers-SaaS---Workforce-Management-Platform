import api from "../lib/axios";

export const getMySessions = async () => {
  const res = await api.get("/sessions");
  return res.data;
};

export const deleteSession = async (id) => {
  const res = await api.delete(`/sessions/${id}`);
  return res.data;
};

export const deleteOtherSessions = async (refreshToken) => {
  const res = await api.delete("/sessions", { data: { refreshToken } });
  return res.data;
};

export const deleteAllSessions = async () => {
  const res = await api.delete("/sessions/all");
  return res.data;
};