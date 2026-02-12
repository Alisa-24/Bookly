import { BookOpen } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--off-white)] text-[var(--charcoal)]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="auth-hero relative hidden overflow-hidden lg:block">
          <img
            alt="Modern minimalist bookstore"
            className="absolute inset-0 h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD09bEdXvLQWN0ZKcag_iuIciYqbYnSz7apabenZzWg93dXf_6kJgBXZZQUV13adKpmeovDwWIqnbMuTPDSA3AmNdoVjXh3m7sykvjfVbJSAl-Sa77nxYcn431ByHfBUuclVX0KVPcSb3Yy2_2IbESrCw5DXcafHgPwj7KiFh97kLqAPEKmEcw0im1doAIaiJ9eTTbq0Y5W-lq9PB9k5wLHo0j93-AoYsauQ04OER9kr8r9cc0Yv8264rzk3pjbxH9_6MeGT-9PhoBs"
          />
          <div className="relative z-10 flex h-full w-full flex-col justify-end gap-4 bg-gradient-to-t from-[var(--beige)]/70 via-transparent to-transparent p-12 text-[var(--charcoal)]">
            <div className="flex items-center gap-2 text-[var(--navy)]">
              <BookOpen className="h-8 w-8" strokeWidth={1.6} />
              <span className="text-2xl font-serif font-bold tracking-tight">
                Bookly
              </span>
            </div>
            <p className="max-w-md text-lg text-[var(--charcoal)]/80">
              A calm home for every shelf, built for modern readers.
            </p>
          </div>
        </section>
        <section className="flex w-full items-center justify-center px-6 py-6">
          <div className="w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="mb-4 flex items-center gap-2 text-[var(--navy)] lg:hidden">
              <BookOpen className="h-7 w-7" strokeWidth={1.6} />
              <span className="text-xl font-serif font-bold tracking-tight">
                Bookly
              </span>
            </div>
            <main className="w-full">{children}</main>
            <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-[var(--charcoal)]/45">
              A calm home for every shelf
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
