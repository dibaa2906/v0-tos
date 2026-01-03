import { Card, CardContent } from "@/components/ui/card"
import { Zap, Shield, Users, Globe } from "lucide-react"

export function CorporateFeatures() {
  const features = [
    {
      icon: Zap,
      title: "Clock In/Out",
      description:
        "Easy clock-in and clock-out system with real-time tracking. Monitor your daily attendance and working hours effortlessly.",
    },
    {
      icon: Shield,
      title: "Attendance History",
      description:
        "View your complete attendance records, track hours worked, and monitor your attendance status all in one place.",
    },
    {
      icon: Users,
      title: "Leave Management",
      description:
        "Submit leave applications, track approval status, and manage different types of leave including annual, sick, and emergency leave.",
    },
    {
      icon: Globe,
      title: "Volume Logs",
      description:
        "Record your daily tasks and activities with our volume logging system. Keep track of your work progress and contributions.",
    },
  ]

  return (
    <section id="features" className="bg-background py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">System Features</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            All the tools you need to manage your attendance and daily activities efficiently.
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
