const withoutPassword = (user) => {
  if (!user) return user;

  const { password, ...publicUser } = user;
  return publicUser;
};

export const toUserDTO = (user) => withoutPassword(user);

export const toAuthenticatedUserDTO = (user) => ({
  id: user?._id?.toString?.() || user?.id,
  email: user?.email,
  role: user?.role || 'user',
});

export const toUserListDTO = (users = []) => users.map(toUserDTO);