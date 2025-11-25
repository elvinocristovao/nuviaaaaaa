const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getSupabase } = require('../supabaseClient');

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
  try {
    const { phone_number, email, password } = req.body;

    if (!phone_number || !password)
      return res.status(400).json({ error: "phone_number and password required" });

    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .or(`phone_number.eq.${phone_number},email.eq.${email}`)
      .limit(1);

    if (existing?.length > 0)
      return res.status(409).json({ error: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    const { data: newUser } = await supabase
      .from("users")
      .insert([{ phone_number, email, password_hash: hash }])
      .select()
      .single();

    const token = jwt.sign({ user_id: newUser.id }, JWT_SECRET, {
      expiresIn: "30d"
    });

    res.json({ token, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    const supabase = getSupabase();

    const { data: users } = await supabase
      .from("users")
      .select("*")
      .eq("phone_number", phone_number)
      .limit(1);

    const user = users?.[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ user_id: user.id }, JWT_SECRET, {
      expiresIn: "30d"
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
