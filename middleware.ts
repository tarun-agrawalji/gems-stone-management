import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Matches all request paths except for the ones starting with:
  // - api/auth (NextAuth routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - public wrapper files like hopeui
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|hopeui|adminkit|.*\\.png$).*)'],
};
