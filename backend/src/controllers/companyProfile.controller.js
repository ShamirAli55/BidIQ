import CompanyProfile from "../models/CompanyProfile.js";

export const createProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.create(req.body);
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create profile" });
  }
};
