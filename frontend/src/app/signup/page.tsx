"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import api from "@/lib/axios";
import AuthLayout from "@/components/LoginForms/AuthLayout";
import InputField from "@/components/LoginForms/InputField";
import Button from "@/components/LoginForms/Button";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nickname: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      router.push("/login");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setError(err.response?.data?.message || "Erro ao criar conta");
    }
  };

  return (
    <AuthLayout title="Cadastro">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          name="nickname"
          type="text"
          value={form.nickname}
          onChange={handleChange}
          placeholder="Nickname"
        />
        <InputField
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <InputField
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Senha"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit">Cadastrar</Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Ja tem uma conta?{" "}
        <a href="/login" className="text-indigo-600 hover:underline">
          Entre
        </a>
      </p>
    </AuthLayout>
  );
}
