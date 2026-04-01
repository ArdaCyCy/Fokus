import { db } from "@/lib/db";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      walletBalanceCents: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Kullanıcılar</h1>
      <p className="text-sm text-muted-foreground">
        Son 200 kayıt. Rol değişimi Clerk metadata veya doğrudan veritabanı ile
        yapılabilir.
      </p>
      <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.08] bg-card/90 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">E-posta / kullanıcı</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Cüzdan (₺)</th>
              <th className="px-3 py-2">Kayıt</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-white/[0.04] hover:bg-card/40"
              >
                <td className="px-3 py-2">
                  <div className="font-medium text-foreground">
                    {u.username ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {u.email ?? u.id.slice(0, 12)}
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{u.role}</td>
                <td className="px-3 py-2">
                  ₺{(u.walletBalanceCents / 100).toLocaleString("tr-TR")}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
