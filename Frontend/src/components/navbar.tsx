"use client";
import { User } from "@/types/types";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "@/API/API";
import { jwtDecode } from "jwt-decode";
import { FaBars, FaTimes } from "react-icons/fa";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<User | undefined>();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  const navLinks = [
    { title: "Home", url: "/" },
    { title: "About", url: "/about" },
    { title: "Services", url: "/services" },
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

    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {!isMobile ? (
        // Laptop Navbar Code Here
        <nav className="bg-primary text-primary-foreground">
          <div className="flex justify-between mx-auto items-center py-4 px-24">
            <div className="text-primary-foreground font-bold text-xl">
              PM
            </div>
            <ul className="flex gap-8 md:gap-16 items-center justify-center text-center cursor-pointer">
              {navLinks.map((link, index) => (
                <li key={index} className="text-primary-foreground text-sm">
                  {link.title}
                </li>
              ))}
            </ul>
            <ul className="flex text-primary-foreground gap-3 items-center cursor-pointer">
              <UserButtons user={user} />
            </ul>
          </div>
        </nav>
      ) : (
        // Mobile Navbar Code Here
        <nav className="bg-primary text-primary-foreground py-4 px-4">
          <div className="mx-auto flex justify-between items-center">
            <div className="text-primary-foreground font-bold text-xl">
              Logo
            </div>
            <div className="flex justify-end items-center gap-3 text-primary-foreground cursor-pointer">
              <UserButtons user={user} />
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
                      {link.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>
      )}
    </>
  );
}

const UserButtons = ({ user }: { user: User | undefined }) => {
  const router = useRouter();
  return (
    <>
      {!user ? (
        <>
          <Button variant="link" className="text-white" onClick={() => router.push("/login")}>
            Login
          </Button>
          <Button variant="secondary" onClick={() => router.push("/signup")}>
            Signup
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => router.push("/profile")}>Profile</Button>
          <Button variant="destructive">Logout</Button>
        </>
      )}
    </>
  );
};
