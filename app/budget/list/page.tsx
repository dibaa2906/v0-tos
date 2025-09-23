import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { BudgetList } from "@/components/budget-list"

export default function BudgetListPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <BudgetList />
      </DashboardLayout>
    </AuthGuard>
  )
}