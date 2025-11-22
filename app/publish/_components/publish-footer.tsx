export function PublishFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur mt-16">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Narraverse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
