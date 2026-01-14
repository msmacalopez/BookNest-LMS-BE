// Calculate DueDate of Borrows
export const calcDueDate = () => {
  const due = new Date();
  due.setDate(due.getDate() + 14);
  return due;
};
