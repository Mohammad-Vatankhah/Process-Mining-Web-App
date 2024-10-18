"use client";

import api from "@/API/API";
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
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSendLink = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.requesResetPasswordLink(email);
      toast.success(res.data.msg);
      router.replace("/login");
    } catch (err) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.msg || "An unexpected error occurred.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-6 rounded-lg shadow-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            {
              "Enter your email, and we'll send you a link to reset your password."
            }
          </p>
          <form onSubmit={handleSendLink}>
            <div className="mb-4">
              <label className="block">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Send Reset Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-gray-600">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
