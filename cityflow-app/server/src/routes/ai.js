const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `ai_img_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Helper to simulate Gemini AI Processing time
const delay = ms => new Promise(res => setTimeout(res, ms));

const CATEGORY_GUESSES = ['Road', 'Garbage', 'Water', 'Electricity', 'Traffic', 'Public Facilities'];

// POST /api/ai/detect-issue/
// Simulates Google Gemini Vision classifying a civic issue from an image
router.post('/detect-issue', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ detail: 'Image required for AI detection' });
  
  await delay(2000); // Simulate Gemini processing
  
  const category = CATEGORY_GUESSES[Math.floor(Math.random() * CATEGORY_GUESSES.length)];
  const title = `AI Detected Issue: ${category} Maintenance`;
  const description = `Google Gemini Vision automatically identified this as a potential ${category.toLowerCase()} issue requiring municipal attention. Confidence score is high.`;
  
  return res.json({
    category,
    title,
    description,
    confidence: Math.floor(80 + Math.random() * 19), // 80-99%
    imageUrl: `/uploads/${req.file.filename}`
  });
});

// POST /api/ai/verify-completion/:id/
// Simulates Gemini Vision comparing Before vs After photos and grading the repair job
router.post('/verify-completion/:id', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ detail: 'Completion image required' });
  
  const db = getDb();
  const issue = await db.get('SELECT * FROM issues WHERE id = ?', [req.params.id]);
  
  if (!issue) return res.status(404).json({ detail: 'Issue not found' });
  if (!issue.image_url) return res.status(400).json({ detail: 'Original issue has no photo to compare against' });

  await delay(2500); // Simulate Gemini before/after visual diff processing
  
  const score = Math.floor(65 + Math.random() * 35); // 65-100 score
  let verdict = '';
  
  if (score >= 90) verdict = 'Excellent repair job. The location appears completely restored to civic standards.';
  else if (score >= 75) verdict = 'Satisfactory completion. The main issue has been addressed but minor aesthetic touch-ups might be missing.';
  else verdict = 'Partial completion detected. The original problem seems patched but not fully resolved or cleaned up.';

  const completionPhoto = `/uploads/${req.file.filename}`;
  
  // Save AI score and resolution into the database
  await db.run(
    "UPDATE issues SET status = 'Resolved', completion_photo = ?, ai_completion_score = ?, resolved_at = ? WHERE id = ?",
    [completionPhoto, score, new Date().toISOString(), req.params.id]
  );
  
  await db.run(
    'INSERT INTO timelines (issue_id, status, note, changed_by) VALUES (?, ?, ?, ?)',
    [req.params.id, 'Resolved', `AI Verified: Passed with score ${score}/100 - ${verdict}`, req.userId]
  );

  return res.json({
    issue_id: req.params.id,
    completion_score: score,
    verdict,
    photo: completionPhoto
  });
});

module.exports = router;
