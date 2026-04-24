import { Header } from "./header";

type AppShellProps = {
  children: React.ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => (
  <div className="min-h-screen bg-[#FFFBF5] dark:bg-[#433E56]">
    <Header />
    <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
  </div>
);
