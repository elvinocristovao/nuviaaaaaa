const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getSupabase } = require('../supabaseClient');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

router.post('/update-goal', auth, async (req, res) => {
  try {
    const { goal_type, daily_calorie_target } = req.body;
    const supabase = getSupabase();

    await supabase.from("calories_profile")
      .update({ goal_type, daily_calorie_target })
      .eq("user_id", req.user.user_id);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
