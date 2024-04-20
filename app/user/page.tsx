import LoginForm from "./LoginForm";

export default function Login() {
  return (
    <div className="flex flex-col gap-y-6 py-2 items-center justify-start">
      <h1 className="font-bold text-3xl">Login Page</h1>
      <LoginForm />
    </div>
  );
}
