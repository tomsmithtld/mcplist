'use client';

import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

export function UserNav() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-8 bg-surface-3 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="/favorites"
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Favorites
        </a>
        <a
          href="/submit"
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Submit
        </a>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <button className="text-sm text-text-muted hover:text-text-primary transition-colors px-3 py-1.5">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="text-sm bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded-lg transition-colors">
          Sign up
        </button>
      </SignUpButton>
    </div>
  );
}
