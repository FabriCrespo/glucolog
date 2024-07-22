"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { NAV_LINKS } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import Button from "./Button";
import { useRouter } from "next/navigation";


const Navbar = () => {
  const [user, setUser] = useState<User | null>(null); // Especifica el tipo User | null
  const router = useRouter();

  const handleSignOut = async () => {
    auth.signOut();
    router.push('/')
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="flexBetween max-container padding-container relative z-30 py-5">
      <Link href="/">
        <Image src="/LogoOG.png" alt="logo" width={74} height={29} />
      </Link>

      {user ? (
        <>
          <ul className="hidden h-full gap-12 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                href={link.href}
                key={link.key}
                className="regular-16 text-gray-50 flexCenter cursor-pointer pb-1.5 transition-all hover:font-bold"
              >
                {link.label}
              </Link>
            ))}
          </ul>

          <div className="lg:flexCenter hidden">
            <Button
              type="button"
              title="Cerrar Sesión"
              icon="/user.svg"
              variant="btn_dark_green"
              onClick={handleSignOut} // Cerrar sesión al hacer clic en el botón
            />
          </div>
        </>
      ) : (
        <div className="lg:flexCenter hidden">
          <Button
            type="button"
            title="Iniciar Sesión"
            icon="/user.svg"
            variant="btn_dark_green"
            link="/login"
          />
        </div>
      )}

      <Image
        src="menu.svg"
        alt="menu"
        width={32}
        height={32}
        className="inline-block cursor-pointer lg:hidden"
      />
    </nav>
  );
};

export default Navbar;
