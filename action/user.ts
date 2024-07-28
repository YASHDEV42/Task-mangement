"use server";

import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";

const googleLogin = async () => {
  await signIn("google");
};

const login = async (prevState, formData: FormData) => {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { message: "Please fill in all fields" };
  }

  await signIn("credentials", {
    redirect: false,
    callbackUrl: "/",
    email,
    password,
  });

  redirect("/");
};

const register = async (prevState, formData: FormData) => {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!firstName || !lastName || !email || !password) {
    return { message: "Please fill in all fields" };
  }

  if (password.length < 6) {
    return { message: "Password must be at least 6 characters" };
  }

  if (password !== formData.get("confirmPassword")) {
    return { message: "Passwords do not match" };
  }

  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { message: "User already exists" };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ firstName, lastName, email, password: hashedPassword });
  redirect("/login");
};

export { register, login, googleLogin };
