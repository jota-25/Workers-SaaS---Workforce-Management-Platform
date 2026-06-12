import api from "../lib/axios";

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const updateMyProfile = async (data) => {
  const res = await api.put("/users/me", data);
  return res.data;
};

export const changePassword = async (data) => {
  const refreshToken = localStorage.getItem("refreshToken");
  const res = await api.put("/users/change-password", {
    ...data,
    refreshToken  //  para que el backend pueda conservar la sesión actual
  });
  return res.data;
};

export const adminResetPassword = async (id, newPassword) => {
  const res = await api.post(`/users/${id}/reset-password`, { newPassword });
  return res.data;
};

export const deactivateUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};
