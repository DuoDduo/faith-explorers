import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

export function SignInLink() {
  return (
    <Link href="/login" className="nav-account">
      <i className="fa-regular fa-user" aria-hidden="true"></i> Sign in
    </Link>
  );
}

/** "Sign in" or the signed-in user's first name, linking to their account. */
export async function AccountNavItem() {
  const user = await getCurrentUser();
  if (!user) return <SignInLink />;
  return (
    <Link href="/account" className="nav-account">
      <i className="fa-solid fa-user" aria-hidden="true"></i> {user.name.split(" ")[0]}
    </Link>
  );
}
