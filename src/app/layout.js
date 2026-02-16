import "./globals.css";

export const metadata = {
  title: "Major League Balatro - Picker",
  description: "Stake & Deck picker for Major League Balatro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
