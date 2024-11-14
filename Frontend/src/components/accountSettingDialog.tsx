"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { User } from "@/types/types";
import api from "@/API/userAPI";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export default function AccountSettingDialog({ user }: { user: User }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordChange = async () => {
    if (currentPassword === "" || newPassword === "") {
      toast.error("Current and new passwords are required");
      return;
    }

    try {
      await api.changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.msg);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Account Settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p>Email: {user?.email}</p>
        </div>
        <Input
          placeholder="Current Password"
          value={currentPassword}
          type="password"
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="New Password"
          value={newPassword}
          type="password"
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-3"
        />
        <DialogFooter>
          <Button onClick={handlePasswordChange}>Change Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
