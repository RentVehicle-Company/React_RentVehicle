const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john123@gmail.com",
  phone: "+855 12 345 678",
  verified: true,
  memberSince: "Jan 2026",
  loginMethod: "Email & Password",
};

let cachedUser = { ...mockUser };

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getCachedUser = () => ({ ...cachedUser });

// TODO: Replace with Spring Boot API call — GET /api/users/me
export const getCurrentUser = async () => {
  await delay(400);
  cachedUser = { ...cachedUser };
  return { ...cachedUser };
};

// TODO: Replace with Spring Boot API call — PUT /api/users/me
export const updateCurrentUser = async (data) => {
  await delay(600);
  cachedUser = { ...cachedUser, ...data };
  return { ...cachedUser };
};
