"use client";

import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center px-4 lg:px-0">
      {/* Side image for large devices, background image for smaller devices */}
      <div
        className="absolute inset-0 bg-cover bg-center lg:relative lg:w-1/2 lg:h-full lg:block"
        style={{
          backgroundImage: 'url("/login.webp")',
        }}
      ></div>

      <div className="z-10 flex h-full w-full max-w-md items-center justify-center  p-6 shadow-lg lg:ml-auto lg:max-h-full lg:w-1/2 lg:max-w-none">
        <LoginForm />
      </div>
    </div>
  );
}
