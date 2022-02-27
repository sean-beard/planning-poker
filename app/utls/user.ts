import { v4 as uuid } from "uuid";

export const getUserId = () => {
  const existingId = sessionStorage.getItem("userId");

  if (existingId) {
    return existingId;
  }

  const userId = uuid();

  sessionStorage.setItem("userId", userId);
  return userId;
};
