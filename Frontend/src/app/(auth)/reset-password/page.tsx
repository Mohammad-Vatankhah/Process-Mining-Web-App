"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast"; // Assuming you're using react-hot-toast
import api from "@/API/API";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (typeof token === "string") {
      try {
        setResetting(true);
        await api.resetPassword(newPassword, token);
        toast.success("Password reset successfully!");
        router.replace("/login");
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.msg || "Failed to reset password."
            : "An unexpected error occurred.";
        toast.error(errorMessage);
      } finally {
        setResetting(false);
      }
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      if (typeof token === "string") {
        try {
          setLoading(true);
          await api.checkResetPasswordToken(token);
          setIsValidToken(true);
        } catch (err) {
          setIsValidToken(false);
        } finally {
          setLoading(false);
        }
      } else {
        setIsValidToken(false);
      }
    };

    checkToken();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-6 rounded-lg shadow-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Loading...</h1>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Invalid Token</h1>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-6 rounded-lg shadow-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <label htmlFor="newPassword" className="block mb-2">
            New Password:
          </label>
          <Input
            type="password"
            id="newPassword"
            name="newPassword"
            placeholder="New Password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 rounded mb-4 w-full"
          />
          <Button type="submit" disabled={resetting} className="w-full p-2">
            {resetting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
