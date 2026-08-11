import CompanyProfile from "../models/CompanyProfile.js";

export const getProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne();
    res.json(profile || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const upsertProfile = async (req, res) => {
  try {
    // Always keep a single company profile document
    const profile = await CompanyProfile.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save profile" });
  }
};
