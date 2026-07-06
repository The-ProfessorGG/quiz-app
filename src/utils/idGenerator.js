// Characters used for session codes - we skip 0/O and 1/I because they
// look alike and are easy to mistype when students read them off a screen.
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Generates a short code like "K7F9QX" that students type in to join.
export function generateSessionCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

// A simple, good-enough-for-an-MVP unique id (no extra library needed).
export function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
