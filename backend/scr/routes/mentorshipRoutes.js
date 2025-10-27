import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { addVideo, getVideos, submitFeedback } from '../controllers/mentorshipController.js';

const router = express.Router();

// Admin-only: upload new video
router.post('/add', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, description, videoFile, language } = req.body;
    const result = await addVideo(req.user.id, title, description, videoFile, language);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Everyone: view mentorship content
router.get('/list/:language', authenticate, async (req, res) => {
  try {
    const videos = await getVideos(req.params.language);
    res.json(videos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
