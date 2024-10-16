"use client";
import Nav, { NavLink } from "@/components/nav";
import { User } from "@/types/types";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "@/API/API";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const [user, setUser] = useState<User | undefined>();

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
    <Nav>
      <NavLink href={"/"}>Home</NavLink>
      {user ? (
        <NavLink href={"/profile"}>Profile</NavLink>
      ) : (
        <NavLink href={"/login"}>Login</NavLink>
      )}
    </Nav>
  );
}
