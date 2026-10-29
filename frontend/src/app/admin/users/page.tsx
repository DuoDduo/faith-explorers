import type { Metadata } from "next";
import Form from "next/form";
import { Suspense } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { updateUser } from "@/lib/actions/admin";
import { getUsers } from "@/lib/api/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";
import { firstParam, pageParam, withQuery } from "@/lib/url";

export const metadata: Metadata = { title: "Users" };

async function Users({ searchParams }: Pick<PageProps<"/admin/users">, "searchParams">) {
  const me = await requireAdmin("/admin/users");
  const params = await searchParams;
  const q = firstParam(params.q)?.trim() || undefined;
  const data = await getUsers(q, pageParam(params.page));

  return (
    <>
      <Form action="/admin/users" className="search-form admin-search" role="search">
        <input
          type="search"
          name="q"
          placeholder="Search by name or email"
          defaultValue={q}
          key={q}
          aria-label="Search users"
        />
        <button type="submit" aria-label="Search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        </button>
      </Form>
      {data.items.length === 0 ? (
        <EmptyState>No users found.</EmptyState>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Joined</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((user) => (
                <tr key={user.id} className={user.is_active ? undefined : "admin-table__muted"}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    {user.id === me.id ? (
                      "Admin (you)"
                    ) : (
                      <UserRoleSelect userId={user.id} role={user.role} name={user.name} />
                    )}
                  </td>
                  <td>
                    {user.id === me.id ? (
                      "Active"
                    ) : user.is_active ? (
                      <AdminButton
                        variant="danger"
                        action={updateUser.bind(null, user.id, { is_active: false })}
                        confirm={`Deactivate ${user.name}? They'll be signed out and can't sign in.`}
                      >
                        Deactivate
                      </AdminButton>
                    ) : (
                      <AdminButton action={updateUser.bind(null, user.id, { is_active: true })}>
                        Reactivate
                      </AdminButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={data.page}
        pages={data.pages}
        hrefFor={(page) => withQuery("/admin/users", { q, page })}
      />
    </>
  );
}

export default function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  return (
    <Suspense fallback={<ListSkeleton rows={5} />}>
      <Users searchParams={searchParams} />
    </Suspense>
  );
}
