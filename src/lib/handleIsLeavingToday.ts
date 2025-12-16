function handleIsLeavingToday(leaveDate: string) {
  const today = new Date();
  const leave = new Date(leaveDate);
  return (
    leave.getDate() <= today.getDate() &&
    leave.getMonth() <= today.getMonth() &&
    leave.getFullYear() <= today.getFullYear()
  );
}
export default handleIsLeavingToday;
