import React from "react";
import prisma from "@/lib/db";
import AdminUsersClient from "./AdminUsersClient";

export const metadata = {
  title: "Staff & User Roles | AL-GAFUR Admin",
  description: "Manage agency team accounts, RBAC roles, and operational access.",
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      status: true,
      lastLogin: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminUsersClient initialUsers={JSON.parse(JSON.stringify(users))} />;
}

