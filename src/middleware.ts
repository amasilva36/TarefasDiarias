import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/",
    "/tarefas/:path*",
    "/lembretes/:path*",
    "/supermercado/:path*"
  ]
};
