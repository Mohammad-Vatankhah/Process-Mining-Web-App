"use client";

import api from "@/API/userAPI";
import { User } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import AccountSettingDialog from "./accountSettingDialog";
import ApplyAlgorithm from "./applyAlgorithm";
import FilesScrollbar from "./filesScrollbar";
import Pagination from "./pagination";
import ProfileProcessCard from "./profileProcessCard";
import ProfileProcessSceleton from "./profileProcessSceleton";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export type FileData = {
  original_filename: string;
  saved_filename: string;
  uploaded_at: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | undefined>();
  const [selectedFile, setSelectedFile] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  const filesPerPage = 9;

  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => api.getHistory(),
  });

  const filteredFiles = search
    ? data?.data.files.filter((file: FileData) =>
        file.original_filename.toLowerCase().includes(search.toLowerCase())
      )
    : data?.data.files;

  const totalPages = filteredFiles
    ? Math.ceil(filteredFiles.length / filesPerPage)
    : 1;

  const currentFiles = filteredFiles?.slice(
    (currentPage - 1) * filesPerPage,
    currentPage * filesPerPage
  );

  useEffect(() => {
    const fetchUser = async (accessToken: string) => {
      try {
        const res = await api.getUser(parseInt(jwtDecode(accessToken).sub!));
        setUser(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    const accessToken = Cookies.get("access_token");
    if (accessToken) {
      fetchUser(accessToken);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="px-2 md:px-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
      </div>
    );
  }

  return (
    <>
      {!selectedFile && (
        <div className="px-2 md:px-32 mb-3 max-w-full flex items-center justify-between gap-2">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-[420px]"
          />
          {user && <AccountSettingDialog user={user} />}
        </div>
      )}

      {data?.data.files.length === 0 && !selectedFile && (
        <div className="flex flex-col justify-center items-center gap-3 mt-6">
          <h2 className="text-2xl">
            Upload your first eventlog or use sample eventlog
          </h2>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/process")}>
              Upload eventlog
            </Button>
            <Button onClick={() => setSelectedFile("loan_process.xes")}>
              Use Sample
            </Button>
          </div>
        </div>
      )}

      <div className="px-2 md:px-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data &&
          !selectedFile &&
          currentFiles?.map((file: FileData, idx: number) => (
            <ProfileProcessCard
              fileData={file}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              key={idx}
            />
          ))}
      </div>

      {totalPages > 1 && !selectedFile && (
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      )}

      {data && selectedFile && (
        <div className="flex">
          <FilesScrollbar
            files={data.data.files}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            filesPerPage={filesPerPage}
          />
          <div className="flex flex-col w-full md:px-20">
            <ApplyAlgorithm
              fileName={selectedFile}
              fromHistory
              selectedFileName={selectedFile}
            />
          </div>
        </div>
      )}
    </>
  );
}
