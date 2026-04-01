import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-wrapper">
          <div className="app-container">{children}</div>
        </div>
      </body>
    </html>
  );
}