export const register = (req, res) => {
  const data = "testing";
  return res.status(200).json({ data, message: "Data Sent" });
};
