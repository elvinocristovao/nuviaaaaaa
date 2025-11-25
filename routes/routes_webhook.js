const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { getSupabase } = require('../supabaseClient');

router.post('/payment', async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const expected = crypto
      .createHmac("sha256", process.env.PAYMENT_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expected)
      return res.status(401).json({ error: "Invalid signature" });

    const event = req.body;

    if (event.status !== "paid") return res.json({ ok: true });

    const phone = event.phone;
    const email = event.email;
    const tempPassword = "Nuvia@2025";

    const supabase = getSupabase();

    const hashed = await bcrypt.hash(tempPassword, 10);

    const { data: user } = await supabase
      .from("users")
      .insert([
        {
          phone_number: phone,
          email,
          password_hash: hashed
        }
      ])
      .select()
      .single();

    await supabase.from("calories_profile").insert([
      { user_id: user.id }
    ]);

    if (email) {
      const transporter = nodemailer.createTransport(process.env.SMTP_URL);

      await transporter.sendMail({
        to: email,
        from: process.env.EMAIL_FROM,
        subject: "Acesso ao NUVIA",
        text: `Bem-vinda ao NUVIA.\nTelefone: ${phone}\nSenha: ${tempPassword}`
      });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
