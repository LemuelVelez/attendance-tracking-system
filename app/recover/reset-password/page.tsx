"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { PasswordRecoveryForm } from "@/app/recover/password-recovery-form";

export default function Page() {
  const imageRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { duration: 1, ease: "power3.out" } });

    tl.from(imageRef.current, { x: -200, opacity: 0 }).from(
      formRef.current,
      { x: 200, opacity: 0 },
      "-=0.5"
    );
  }, []);

  return (
    <div className="relative flex h-screen w-full items-center justify-center px-4 lg:px-0">
      {/* Side image for large devices, background image for smaller devices */}
      <div
        ref={imageRef}
        className="absolute inset-0 bg-cover bg-center lg:relative lg:w-1/2 lg:h-full lg:block"
        style={{
          backgroundImage: 'url("/recover.png")',
        }}
      ></div>

      <div
        ref={formRef}
        className="z-10 flex h-full w-full max-w-md items-center justify-center p-6 shadow-lg lg:ml-auto lg:max-h-full lg:w-1/2 lg:max-w-none"
      >
        <PasswordRecoveryForm />
      </div>
    </div>
  );
}
