import { supabase } from '../config/supabaseClient.js';

// Admin adds mentorship video
export const addVideo = async (adminId, title, description, videoFile, language = 'english') => {
  // 1️⃣ Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('mentorship-videos')
    .upload(`videos/${videoFile.name}`, videoFile, { cacheControl: '3600', upsert: true });

  if (uploadError) throw uploadError;

  // 2️⃣ Get public signed URL
  const { data: urlData } = supabase.storage
    .from('mentorship-videos')
    .getPublicUrl(uploadData.path);

  // 3️⃣ Insert into mentorship table
  const { data, error } = await supabase
    .from('mentorships')
    .insert({
      title,
      description,
      video_url: urlData.publicUrl,
      language,
      created_by: adminId
    })
    .select();

  if (error) throw error;
  return data[0];
};

// Fetch videos for users
export const getVideos = async (language = 'english') => {
  const { data, error } = await supabase
    .from('mentorships')
    .select('*')
    .eq('language', language)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Submit feedback
export const submitFeedback = async (userId, mentorshipId, rating, comment = '') => {
  const { data, error } = await supabase
    .from('feedback')
    .insert({ user_id: userId, mentorship_id: mentorshipId, rating, comment })
    .select();

  if (error) throw error;
  return data[0];
};
