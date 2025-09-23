import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AddBudgetForm } from "@/components/add-budget-form"

export default function AddBudgetPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <AddBudgetForm />
      </DashboardLayout>
    </AuthGuard>
  )
}