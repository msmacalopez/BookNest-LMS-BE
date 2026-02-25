// Calculate DueDate of Borrows
export const calcDueDate = (days = 15) => {
  const d = new Date();
  //days for production
  //d.setDate(d.getDate() + days);

  //minutes for testing
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  return d;
};
