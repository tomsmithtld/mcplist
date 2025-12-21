import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-text-primary hover:text-accent transition-colors">
            <span className="text-accent">&lt;/&gt;</span>
            MCPList
          </a>
          <p className="text-text-muted mt-2">Create an account to vote, save favorites, and submit servers</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-surface-1 border border-border-subtle shadow-xl",
              headerTitle: "text-text-primary",
              headerSubtitle: "text-text-muted",
              socialButtonsBlockButton: "bg-surface-2 border-border-subtle hover:bg-surface-3",
              socialButtonsBlockButtonText: "text-text-primary",
              dividerLine: "bg-border-subtle",
              dividerText: "text-text-muted",
              formFieldLabel: "text-text-secondary",
              formFieldInput: "bg-surface-2 border-border-subtle text-text-primary",
              formButtonPrimary: "bg-accent hover:bg-accent-hover",
              footerActionLink: "text-accent hover:text-accent-hover",
            },
          }}
        />
      </div>
    </div>
  );
}
