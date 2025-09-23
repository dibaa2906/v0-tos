"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

const departments = [
  "Administration",
  "Finance",
  "Operation",
  "Safety",
  "Technical",
  "IT",
  "GM Office"
]

export function AddBudgetForm() {
  const [formData, setFormData] = useState({
    projectName: "",
    budgetCost: "",
    actualCost: "",
    status: "planned" as "planned" | "in-progress" | "completed" | "overbudget",
    remark: "",
    department: "Administration"
  })

  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.projectName || !formData.budgetCost) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      })
      return
    }

    // Here you would typically save to a database or state management
    // For now, we'll just show a success message
    toast({
      title: "Success",
      description: "Budget added successfully"
    })

    // Reset form
    setFormData({
      projectName: "",
      budgetCost: "",
      actualCost: "",
      status: "planned",
      remark: "",
      department: "Administration"
    })
  }

  const handleBack = () => {
    router.push("/budget/list")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Budget List
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Add New Budget</h2>
          <p className="text-muted-foreground">Create a new project budget entry</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
          <CardDescription>
            Enter the project budget information below. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="budgetCost">Budget Cost *</Label>
                <Input
                  id="budgetCost"
                  type="number"
                  value={formData.budgetCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, budgetCost: e.target.value }))}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualCost">Actual Cost</Label>
                <Input
                  id="actualCost"
                  type="number"
                  value={formData.actualCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualCost: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as typeof formData.status }))}
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overbudget">Over Budget</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remark">Remark</Label>
              <Input
                id="remark"
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                placeholder="Optional remarks or notes"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Budget
              </Button>
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}