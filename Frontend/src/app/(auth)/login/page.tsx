"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import toast from "react-hot-toast";
import api from "@/API/userAPI";
import Cookies from "js-cookie";
import { IoIosArrowRoundBack } from "react-icons/io";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    loading: false,
  });

  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setFormData((prevState) => ({ ...prevState, loading: true }));
      const res = await api.login(formData.email, formData.password);
      Cookies.set("access_token", res.data.access_token);
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
            <h1 className="text-2xl font-bold text-center">Login</h1>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
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
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={formData.loading}
            >
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p>
            {"Don't have an account? "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
