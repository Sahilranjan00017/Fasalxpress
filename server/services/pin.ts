import nodemailer from "nodemailer";
import { randomInt } from "crypto";
import createSupabaseServer from "../lib/supabase/server";

const supabase = createSupabaseServer();

function getMailer() {
  const user = process.env.NODEMAILER_EMAIL;
  const pass = process.env.NODEMAILER_PASSWORD;
  const from = process.env.NODEMAILER_FROM || user;

  if (!user || !pass || !from) {
    throw new Error("Missing Nodemailer env vars (NODEMAILER_EMAIL/PASSWORD/FROM)");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return { transporter, from };
}

function generatePin(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function sendPin(email: string) {
  const pin = generatePin();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: upsertError } = await supabase
    .from("login_pins")
    .upsert({ email, pin, expires_at: expiresAt, used: false }, { onConflict: "email" })
    .select()
    .single();

  if (upsertError) throw upsertError;

  const { transporter, from } = getMailer();

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your AGROBUILD login PIN",
    text: `Your login PIN is ${pin}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
    html: `<p>Your login PIN is <strong>${pin}</strong>.</p><p>It expires in 10 minutes.</p><p>If you did not request this, please ignore this email.</p>`,
  });

  return { ok: true };
}

export async function verifyPin(email: string, pin: string) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("login_pins")
    .select("email, pin, expires_at, used")
    .eq("email", email)
    .eq("pin", pin)
    .eq("used", false)
    .gt("expires_at", now)
    .single();

  if (error || !data) throw new Error("Invalid or expired PIN");

  const { error: updateError } = await supabase
    .from("login_pins")
    .update({ used: true })
    .eq("email", email)
    .eq("pin", pin);

  if (updateError) throw updateError;

  // Check if user exists; if not, create with role 'user'
  let { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("email", email)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = no rows, anything else is a real error
    throw new Error("Failed to fetch user");
  }

  let userData = existingUser;

  if (!existingUser) {
    // Create new user with role 'user' (lowercase)
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ email, name: email.split("@")[0], role: "user" })
      .select("id, name, email, role")
      .single();

    if (insertError || !newUser) {
      throw new Error("Failed to create user");
    }
    userData = newUser;
  }

  const user = { id: userData.id, email: userData.email, name: userData.name, role: userData.role };
  const session = { user };
  return { user, session };
}
