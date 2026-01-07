import { Card, CardContent } from "@/components/ui/card"
import { Zap, Shield, Users, Globe } from "lucide-react"

export function CorporateFeatures() {
  const features = [
    {
      icon: Zap,
      title: "Faster iteration. More innovation.",
      description:
        "The platform for rapid progress. Let your team focus on shipping features instead of managing infrastructure with automated CI/CD, built-in testing, and integrated collaboration.",
    },
    {
      icon: Shield,
      title: "Enterprise-grade security",
      description:
        "Built with security at the forefront. SOC 2 Type II compliant, GDPR ready, and enterprise SSO integration to keep your data safe and compliant.",
    },
    {
      icon: Users,
      title: "Make teamwork seamless",
      description:
        "Tools for your team and stakeholders to share feedback and iterate faster. Real-time collaboration, preview deployments, and integrated workflows.",
    },
    {
      icon: Globe,
      title: "Global scale, local performance",
      description:
        "Deploy to the edge with automatic optimization. CDN, serverless functions, and global infrastructure that scales with your business needs.",
    },
  ]

  return (
    <section id="features" className="bg-background py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Built for enterprise teams</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to build, deploy, and scale modern web applications with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <feature.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
