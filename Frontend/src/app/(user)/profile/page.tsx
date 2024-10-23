import Navbar from "@/components/navbar";
import ProfileProcessSceleton from "@/components/profileProcessSceleton";
import React from "react";

export default function Profile() {
  return (
    <>
      <Navbar />
      <div className="mt-5">
        <div className="px-2 md:px-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileProcessSceleton />
          <ProfileProcessSceleton />
          <ProfileProcessSceleton />
          <ProfileProcessSceleton />
          <ProfileProcessSceleton />
          <ProfileProcessSceleton />
        </div>
      </div>
    </>
  );
}
