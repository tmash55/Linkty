import Link from "next/link";

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl mt-4">Page Not Found</h2>
      <p className="mt-4 text-center">
        The page you&apos;re looking for doesn&apos;t exist or the short link is
        invalid.
      </p>
      <Link href="/" className="mt-6 text-blue-600 hover:underline">
        Go back home
      </Link>
    </div>
  );
}
