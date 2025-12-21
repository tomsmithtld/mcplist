import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCPList - The Directory of MCP Servers",
  description: "Find and integrate the perfect Model Context Protocol servers for Claude Code, Claude Desktop, and other MCP clients. Browse 35+ curated servers by category.",
  keywords: ["mcp servers", "model context protocol", "claude code", "claude desktop", "mcp directory", "mcplist"],
  openGraph: {
    title: "MCPList - The Directory of MCP Servers",
    description: "Find the perfect MCP servers for Claude Code and Claude Desktop",
    type: "website",
    siteName: "MCPList",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCPList - The Directory of MCP Servers",
    description: "Find the perfect MCP servers for Claude Code and Claude Desktop",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-surface-0">
        {children}
      </body>
    </html>
  );
}
