import supabase from "../config/supabaseClient.js";


// Get all users (Admin)
export const getAllUsers = async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
};


// Get all savings records
export const getAllSavings = async (req, res) => {
  const { data, error } = await supabase.from("savings").select("*");

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
};

//Delete a user 
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: "User deleted successfully" });
};

// Add mentorship content 
export const addMentorshipVideo = async (req, res) => {
  const { title, url, language } = req.body;

  const { data, error } = await supabase
    .from("mentorship_videos")
    .insert([{ title, url, language }]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: "Mentorship video added", data });
};



// admin role check
// const { data: { user } } = await supabase.auth.getUser(req.headers.authorization);

// if (user.role !== "admin") return res.status(403).json({ error: "Access denied" });
