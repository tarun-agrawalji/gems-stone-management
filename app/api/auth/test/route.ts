import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    const admin = await prisma.user.findUnique({
      where: { email: "admin@gems.com" },
    });

    const results = {
      usersCount: users.length,
      users: users.map(u => ({ email: u.email, id: u.id, role: u.role })),
      adminExists: !!admin,
      passwordValid: admin ? await bcrypt.compare("admin123", admin.password) : false,
      databaseUrlLength: process.env.DATABASE_URL?.length,
    };

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
