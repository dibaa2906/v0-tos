"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface BudgetItem {
  id: string
  projectName: string
  budgetCost: number
  actualCost: number
  status: "planned" | "in-progress" | "completed" | "overbudget"
  remark: string
  department: string
}

const departments = [
  "Administration",
  "Finance",
  "Operation",
  "Safety",
  "Technical",
  "IT",
  "GM Office"
]

const statusColors = {
  planned: "bg-blue-100 text-blue-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  overbudget: "bg-red-100 text-red-800"
}

export function BudgetList() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([
    {
      id: "1",
      projectName: "Office Renovation",
      budgetCost: 50000,
      actualCost: 45000,
      status: "completed",
      remark: "Completed under budget",
      department: "Administration"
    },
    {
      id: "2",
      projectName: "Financial System Upgrade",
      budgetCost: 75000,
      actualCost: 80000,
      status: "overbudget",
      remark: "Additional features requested",
      department: "Finance"
    },
    {
      id: "3",
      projectName: "Safety Training Program",
      budgetCost: 25000,
      actualCost: 15000,
      status: "in-progress",
      remark: "On track",
      department: "Safety"
    }
  ])

  const { toast } = useToast()
  const router = useRouter()

  const handleEdit = (budget: BudgetItem) => {
    // For now, just show a toast. In a real app, you'd navigate to an edit page
    toast({
      title: "Edit Budget",
      description: `Editing ${budget.projectName}. Edit functionality would be implemented here.`
    })
  }

  const handleDelete = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id))
    toast({
      title: "Success",
      description: "Budget deleted successfully"
    })
  }

  const handleAddBudget = () => {
    router.push("/budget/add")
  }



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Budget List</h2>
          <p className="text-muted-foreground">View and manage all project budgets</p>
        </div>
        
        <Button onClick={handleAddBudget}>
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </Button>
      </div>



      {/* Combined Budget Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            All Budget Items
          </CardTitle>
          <CardDescription>
            {budgets.length} total project budget(s) across all departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Budget Cost</TableHead>
                <TableHead>Actual Cost</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remark</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No budget items found. Click "Add Budget" to create your first budget entry.
                  </TableCell>
                </TableRow>
              ) : (
                budgets
                  .sort((a, b) => a.department.localeCompare(b.department))
                  .map(budget => {
                    const variance = budget.actualCost - budget.budgetCost
                    const isOverBudget = variance > 0

                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">
                          {budget.department}
                        </TableCell>
                        <TableCell className="font-medium">
                          {budget.projectName}
                        </TableCell>
                        <TableCell>
                          ${budget.budgetCost.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          ${budget.actualCost.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                            {isOverBudget ? '+' : ''}${Math.abs(variance).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[budget.status]}>
                            {budget.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {budget.remark || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(budget)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(budget.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}