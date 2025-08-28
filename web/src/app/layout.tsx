import "./globals.css";
import { I18nProvider } from "./i18n-provider";

export const metadata = { title: 'Orders Availability' };

export default function RootLayout(
  { children }: { children: React.ReactNode }
) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
