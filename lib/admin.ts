// Admins são definidos por ID de conta ("github:123", "google:456") na env ADMIN_USER_IDS, separados por vírgula.
// O ID aparece em /conta para quem está logado.
export const isAdmin = (uid?: string | null) =>
  !!uid &&
  (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(uid);
