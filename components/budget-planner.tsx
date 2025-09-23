"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export function BudgetPlanner() {
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

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null)
    const [formData, setFormData] = useState({
        projectName: "",
        budgetCost: "",
        actualCost: "",
        status: "planned" as BudgetItem["status"],
        remark: "",
        department: "Administration"
    })

    const { toast } = useToast()

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

        const budgetItem: BudgetItem = {
            id: editingBudget?.id || Date.now().toString(),
            projectName: formData.projectName,
            budgetCost: parseFloat(formData.budgetCost),
            actualCost: parseFloat(formData.actualCost) || 0,
            status: formData.status,
            remark: formData.remark,
            department: formData.department
        }

        if (editingBudget) {
            setBudgets(prev => prev.map(b => b.id === editingBudget.id ? budgetItem : b))
            toast({
                title: "Success",
                description: "Budget updated successfully"
            })
        } else {
            setBudgets(prev => [...prev, budgetItem])
            toast({
                title: "Success",
                description: "Budget added successfully"
            })
        }

        resetForm()
    }

    const resetForm = () => {
        setFormData({
            projectName: "",
            budgetCost: "",
            actualCost: "",
            status: "planned",
            remark: "",
            department: "Administration"
        })
        setEditingBudget(null)
        setIsDialogOpen(false)
    }

    const handleEdit = (budget: BudgetItem) => {
        setEditingBudget(budget)
        setFormData({
            projectName: budget.projectName,
            budgetCost: budget.budgetCost.toString(),
            actualCost: budget.actualCost.toString(),
            status: budget.status,
            remark: budget.remark,
            department: budget.department
        })
        setIsDialogOpen(true)
    }

    const handleDelete = (id: string) => {
        setBudgets(prev => prev.filter(b => b.id !== id))
        toast({
            title: "Success",
            description: "Budget deleted successfully"
        })
    }

    const getBudgetsByDepartment = (department: string) => {
        return budgets.filter(b => b.department === department)
    }

    const getDepartmentTotal = (department: string) => {
        const deptBudgets = getBudgetsByDepartment(department)
        return {
            budgetTotal: deptBudgets.reduce((sum, b) => sum + b.budgetCost, 0),
            actualTotal: deptBudgets.reduce((sum, b) => sum + b.actualCost, 0)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Budget Planner</h2>
                    <p className="text-muted-foreground">Manage project budgets across departments</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => resetForm()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Budget
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingBudget ? "Edit Budget" : "Add New Budget"}</DialogTitle>
                            <DialogDescription>
                                Enter the project budget details below.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <div className="grid grid-cols-2 gap-4">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as BudgetItem["status"] }))}
                                    >
                                        <option value="planned">Planned</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="overbudget">Over Budget</option>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="remark">Remark</Label>
                                <Input
                                    id="remark"
                                    value={formData.remark}
                                    onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                                    placeholder="Optional remarks"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingBudget ? "Update" : "Add"} Budget
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Department Budget Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map(department => {
                    const { budgetTotal, actualTotal } = getDepartmentTotal(department)
                    const budgetCount = getBudgetsByDepartment(department).length

                    return (
                        <Card key={department}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">{department}</CardTitle>
                                <CardDescription>{budgetCount} project(s)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Budget Total:</span>
                                        <span className="font-medium">${budgetTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Actual Total:</span>
                                        <span className="font-medium">${actualTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Variance:</span>
                                        <span className={`font-medium ${actualTotal > budgetTotal ? 'text-red-600' : 'text-green-600'}`}>
                                            ${Math.abs(budgetTotal - actualTotal).toLocaleString()}
                                            {actualTotal > budgetTotal ? ' over' : ' under'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
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