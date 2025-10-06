"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import api from "@/lib/axios";
import AuthLayout from "@/components/LoginForms/AuthLayout";
import InputField from "@/components/LoginForms/InputField";
import Button from "@/components/LoginForms/Button";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/auth/login", form);
      router.push("/home");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setError(err.response?.data?.message || "Email ou senha inválidos");
    }
  };

  return (
    <AuthLayout title="Login">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <InputField name="password" type="password" value={form.password} onChange={handleChange} placeholder="Senha" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit">Entrar</Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Não tem conta?{" "}
        <a href="/signup" className="text-indigo-600 hover:underline">
          Registre-se
        </a>
      </p>
    </AuthLayout>
  );
}
