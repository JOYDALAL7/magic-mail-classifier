import "./globals.css";
import ClientProvider from "./ClientProvider";

export const metadata = {
  title: "Magic Mail Classifier",
  description: "Classify and sort your emails with AI."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 flex flex-col">
        {/* Your header can go here */}
        <ClientProvider>
          {children}
        </ClientProvider>
        {/* Your footer can go here */}
      </body>
    </html>
  );
}
