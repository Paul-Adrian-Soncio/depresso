"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createSessionToken,
  verifyDemoPassword,
} from "@/lib/admin-session";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  if (!verifyDemoPassword(password)) {
    redirect(`/admin/login?error=1&from=${encodeURIComponent(from)}`);
  }

  const { value, maxAgeSeconds } = createSessionToken();
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSeconds,
    path: "/",
  });

  redirect(from.startsWith("/admin") ? from : "/admin");
}
