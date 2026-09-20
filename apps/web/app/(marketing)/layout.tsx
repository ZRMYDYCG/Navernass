import { AnnouncementBar } from './_components/announcement-bar'
import Footer from './_components/footer'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AnnouncementBar />
      <main className="flex-1 pt-10">{children}</main>
      <Footer />
    </div>
  )
}
