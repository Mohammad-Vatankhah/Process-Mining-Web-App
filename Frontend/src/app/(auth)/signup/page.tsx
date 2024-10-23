"use client";

import api from "@/API/userAPI";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { IoIosArrowRoundBack } from "react-icons/io";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    loading: false,
  });

  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords does not match");
      return;
    }
    try {
      setFormData((prevState) => ({ ...prevState, loading: true }));
      const res = await api.signup(formData.email, formData.password);
      Cookies.set("access_token", res.data.user_data.access_token);
      router.replace("/profile");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.msg || "An unexpected error occurred.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setFormData((prevState) => ({ ...prevState, loading: false }));
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-6 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-center relative">
            <div
              className="absolute left-0 text-3xl cursor-pointer"
              onClick={() => router.push("/")}
            >
              <IoIosArrowRoundBack />
            </div>
            <h1 className="text-2xl font-bold text-center">Sign Up</h1>
          </div>{" "}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="block">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full mt-1"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                className="w-full mt-1"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm your password"
                className="w-full mt-1"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
