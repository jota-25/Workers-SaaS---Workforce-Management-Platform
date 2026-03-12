import api from "../lib/axios";

export const getInvitations = async () => {
  const res = await api.get("/invitations");
  return res.data;
};

export const resendInvitation = async (id) => {
  const res = await api.post(`/invitations/${id}/resend`);
  return res.data;
};

export const cancelInvitation = async (id) => {
  const res = await api.delete(`/invitations/${id}`);
  return res.data;
};