import api from "../lib/axios";

export const getWorkers = async (params = {}) => {
  const res = await api.get("/workers", { params });
  return res.data; // acepta { name, page, limit }
};

export const createWorker = async (data) => {
  const res = await api.post("/workers", data);
  return res.data;
};

export const updateWorker = async (id, data) => {
  const res = await api.put(`/workers/${id}`, data);
  return res.data;
};

export const deleteWorker = async (id) => {
  const res = await api.delete(`/workers/${id}`);
  return res.data;
};