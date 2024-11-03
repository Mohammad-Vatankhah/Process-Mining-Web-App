import Navbar from "@/components/navbar";
import ProfilePage from "@/components/profilePage";
import React from "react";

export default function Profile() {
  return (
    <>
      <Navbar />
      <div className="mt-5">
        <ProfilePage />
      </div>
    </>
  );
}
