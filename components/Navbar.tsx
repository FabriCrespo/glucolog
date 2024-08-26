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
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    auth.signOut();
    router.push('/');
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

      {/* Icono del menú "burger" visible solo en móviles */}
      <Image
        src="/menu.svg"
        alt="menu"
        width={32}
        height={32}
        className="inline-block cursor-pointer lg:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
      />

      {/* Menú de navegación para pantallas grandes */}
      <ul className={`hidden lg:flex h-full gap-12 ${menuOpen ? 'block' : ''}`}>
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

      {user ? (
        <div className="lg:flexCenter hidden">
          <Button
            type="button"
            title="Cerrar Sesión"
            icon="/user.svg"
            variant="btn_dark_green"
            onClick={handleSignOut}
          />
        </div>
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

      {/* Menú desplegable para pantallas pequeñas */}
      {menuOpen && (
        <ul className="absolute right-0 p-3 top-24 w-full bg-white flex flex-col items-center space-y-4 lg:hidden shadow-md ">
          {NAV_LINKS.map((link) => (
            <Link
              href={link.href}
              key={link.key}
              className="regular-16 text-black flexCenter cursor-pointer py-2 transition-all hover:font-bold"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flexCenter">
            {user ? (
              <Button
                type="button"
                title="Cerrar Sesión"
                icon="/user.svg"
                variant="btn_dark_green"
                onClick={() => {
                  handleSignOut();
                  setMenuOpen(false);
                }}
              />
            ) : (
              <Button
                type="button"
                title="Iniciar Sesión"
                icon="/user.svg"
                variant="btn_dark_green"
                link="/login"
                onClick={() => setMenuOpen(false)}
              />
            )}
          </div>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
