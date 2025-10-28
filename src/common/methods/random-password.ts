export const generateRandomPassword = (): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  let password = '';
  const length = 8;

  do {
    password = Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  } while (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([A-Za-z\d]|[^ ]){8,20}$/.test(password)
  );

  return password;
};
