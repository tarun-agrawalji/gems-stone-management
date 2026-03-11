import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, name, organizationName } = await request.json();

    if (!email || !password || !name || !organizationName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the organization and user in an interactive transaction
    const result = await prisma.$transaction(async (tx) => {
      const newOrganization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "ADMIN",
          organizationId: newOrganization.id,
        },
      });

      return { user: newUser, organization: newOrganization };
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        organization: result.organization.name,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed", details: error.message },
      { status: 500 }
    );
  }
}
