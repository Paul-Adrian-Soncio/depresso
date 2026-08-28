import { login } from "@/app/admin/login/actions";
import { Mascot } from "@/components/mascot";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { error, from } = await searchParams;
  const demoPassword = process.env.ADMIN_DEMO_PASSWORD ?? "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-8" data-period="dusk">
      <div className="flex flex-col items-center gap-2 text-center">
        <Mascot className="h-20 w-auto" />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-text">
          Depresso · Admin
        </p>
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-ink">
          This is a demo. Come on in.
        </h1>
        <p className="max-w-sm font-body text-base text-ink-2">
          Nobody has to guess a password to see the backend. It&apos;s filled in
          below — just press enter.
        </p>
      </div>

      <form
        action={login}
        className="flex w-full max-w-sm flex-col gap-4 rounded-md border border-line bg-surface p-6"
      >
        <input type="hidden" name="from" value={from ?? "/admin"} />

        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-3">
            Demo password
          </span>
          <input
            type="text"
            name="password"
            defaultValue={demoPassword}
            autoFocus
            className="rounded-sm border border-line-strong bg-ground px-3 py-2 font-mono text-sm text-ink outline-none focus-visible:border-accent"
          />
        </label>

        {error && (
          <p className="font-mono text-xs text-accent-text">
            That wasn&apos;t it — try the password shown above.
          </p>
        )}

        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 font-display text-sm font-bold text-on-accent transition-colors duration-base hover:opacity-90"
        >
          Enter the admin
        </button>
      </form>
    </main>
  );
}
