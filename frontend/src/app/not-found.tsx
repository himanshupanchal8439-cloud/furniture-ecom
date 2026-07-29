import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center md:py-32">
      <p className="font-serif-display text-6xl text-walnut">404</p>
      <h1 className="font-serif-display text-2xl md:text-3xl">Page Not Found</h1>
      <p className="max-w-md text-sm text-foreground/60">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link href="/" className="mt-2 rounded-full bg-walnut px-6 py-2.5 text-sm text-white">
        Back to Home
      </Link>
    </div>
  );
}
