import { cookies } from "next/headers";
import { COOKIE, verifyToken } from "@/lib/jwt";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const token = (await cookies()).get(COOKIE)?.value;
  const claims = token ? await verifyToken(token) : null;

  return (
    <HeaderClient
      claims={claims ? { sub: claims.sub, role: claims.role } : null}
    />
  );
}