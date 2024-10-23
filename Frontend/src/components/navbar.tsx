"use client";
import { User } from "@/types/types";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "@/API/userAPI";
import { jwtDecode } from "jwt-decode";
import { FaBars, FaTimes } from "react-icons/fa";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<User | undefined>();
  const [showModal, setShowModal] = useState(false);

  const navLinks = [
    { title: "Home", url: "/" },
    { title: "Process", url: "/process" },
    { title: "About", url: "/about" },
    { title: "Contact", url: "/contact" },
  ];

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleBarsIconClick = () => {
    toggleModal();
  };

  useEffect(() => {
    const fetchUser = async (accessToken: string) => {
      try {
        const res = await api.getUser(jwtDecode(accessToken).sub);
        setUser(res.data);
      } catch (error) {
        console.log("");
      }
    };
    const accessToken = Cookies.get("access_token");
    if (accessToken) {
      fetchUser(accessToken);
    }
  }, []);

  return (
    <>
      {/* large screen nav */}
      <nav className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-sm hidden md:block">
        <div className="flex justify-between mx-auto items-center py-4 px-24">
          <div className="text-primary-foreground font-bold text-xl">PM</div>
          <ul className="flex gap-8 md:gap-16 items-center justify-center text-center cursor-pointer">
            {navLinks.map((link, index) => (
              <li key={index} className="text-primary-foreground text-md">
                <Link href={link.url}>{link.title}</Link>
              </li>
            ))}
          </ul>
          <ul className="flex text-primary-foreground gap-3 items-center cursor-pointer">
            <UserButtons user={user} setUser={setUser} />
          </ul>
        </div>
      </nav>
      {/* mobile nav */}
      <nav className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-50 shadow-sm md:hidden">
        <div className="mx-auto flex justify-between items-center">
          <div className="text-primary-foreground font-bold text-xl">Logo</div>
          <div className="flex justify-end items-center gap-3 text-primary-foreground cursor-pointer">
            <UserButtons user={user} setUser={setUser} />
            <FaBars
              onClick={handleBarsIconClick}
              className="text-primary-foreground cursor-pointer"
            />
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 flex justify-center items-center">
            <div className="absolute inset-0 bg-primary" />
            <FaTimes
              className="absolute top-6 right-4 text-primary-foreground cursor-pointer"
              onClick={toggleModal}
              style={{ fontSize: "16px" }}
            />
            <div className="relative bg-primary w-full">
              <div className="flex flex-col gap-8 items-center justify-center h-full">
                {navLinks.map((link, index) => (
                  <span
                    key={index}
                    className="text-secondary-foreground font-light text-2xl cursor-pointer"
                  >
                    <Link href={link.url}>{link.title}</Link>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

const UserButtons = ({
  user,
  setUser,
}: {
  user: User | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}) => {
  const router = useRouter();

  const handleLogout = () => {
    setUser(undefined);
    Cookies.remove("access_token");
  };

  return (
    <>
      {!user ? (
        <>
          <Button
            variant="link"
            className="text-white"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
          <Button variant="secondary" onClick={() => router.push("/signup")}>
            Signup
          </Button>
        </>
      ) : (
        <>
          <Button variant="secondary" onClick={() => router.push("/profile")}>
            Profile
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </>
      )}
    </>
  );
};
