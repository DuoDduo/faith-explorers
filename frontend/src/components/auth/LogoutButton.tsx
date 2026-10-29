import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="retry-button">
        Sign out
      </button>
    </form>
  );
}
