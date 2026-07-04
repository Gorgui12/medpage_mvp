// app/login/page.js
import LoginForm from "@/app/components/LoginForm";

export const metadata = {
  title: "Connexion — MedPage",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-50 text-teal-700 inline-block mb-4">
            MedPage
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
          <p className="text-sm text-slate-500 mt-1">
            Accédez à votre tableau de bord
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
