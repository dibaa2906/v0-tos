export function CorporateStats() {
  const stats = [
    {
      value: "20 days",
      label: "saved",
      description: "on daily builds.",
      company: "NETFLIX",
    },
    {
      value: "98%",
      label: "faster",
      description: "time to market.",
      company: "TripAdvisor",
    },
    {
      value: "300%",
      label: "increase",
      description: "in SEO.",
      company: "box",
    },
    {
      value: "6x",
      label: "faster",
      description: "to build + deploy.",
      company: "ebay",
    },
  ]

  return (
    <section className="border-t border-border bg-background py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-foreground sm:text-4xl">
                {stat.value} <span className="text-muted-foreground font-normal">{stat.label}</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.description}</div>
              <div className="mt-4 text-lg font-semibold text-foreground">{stat.company}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
