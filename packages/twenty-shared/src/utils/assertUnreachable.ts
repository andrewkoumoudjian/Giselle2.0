export const assertUnreachable = (
  value: never,
  errorMessage = 'Unreachable case statement',
): never => {
  throw new Error(errorMessage);
};

export default assertUnreachable;
