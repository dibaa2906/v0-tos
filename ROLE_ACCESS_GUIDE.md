# Role-Based Access Control Guide

This guide defines which modules and features each user role can access in the system.

## User Roles

### 1. Employee
- **Description**: Regular staff members who work in a specific department
- **Access Level**: Department-specific, limited CRUD operations
- **Department Restriction**: Can only access their own department's data

### 2. Manager
- **Description**: Department managers or supervisors
- **Access Level**: Own department access, full CRUD operations
- **Department Restriction**: Can only access their own department (same as employee but with more permissions)

### 3. Admin
- **Description**: System administrators with full access
- **Access Level**: System-wide access, all operations
- **Department Restriction**: No restrictions, can access all departments

## Module Access Matrix

| Module               | Employee        | Manager           | Admin              | Notes |
|----------------------|-----------------|-------------------|--------------------|------------|
| **Dashboard**        | ✅ Own Dept     | ✅ Own Dept      | ✅ All Depts       | Both employee and manager see department-specific dashboard |
| **Budget - Add**     | ✅ Own Dept     | ✅ Own Dept      | ✅ All Depts       | Both employee and manager can add to their department |
| **Budget - List**    | ✅ Own Dept     | ✅ Own Dept      | ✅ All Depts       | Employee can see list of their department items |
| **Budget - Edit**    | ✅ Own Dept     | ✅ Own Dept      | ✅ All Depts       | Both can edit their department items |
| **Budget - Delete**  | ❌              | ✅ Own Dept      | ✅ All Depts       | Only manager can delete items in their department |
| **Budget - Reports** | ✅ Own Dept     | ✅ Own Dept      | ✅ All Depts       | Department-specific reports |
| **Users Management** | ❌              | ❌               | ✅                 | Only admins can manage users |
| **Analytics**        | ✅ Own Dept     | ✅ Own Dept      | ✅ All Depts       | Department-specific analytics |
| **Settings**         | ✅ Profile Only | ✅ Profile + Dept| ✅ System Settings | Manager can modify some department settings |

## Department Access Rules

### Employee Access Pattern
```typescript
// Example: John Doe (Employee, Technical Department)
const employeeAccess = {
  departments: ["Technical"], // Only own department
  budgetOperations: {
    create: true,  // Can add budget items to Technical dept
    read: true,    // Can view Technical dept budget items
    update: true,  // Can edit Technical dept budget items
    delete: false  // Cannot delete any budget items
  },
  crossDepartmentView: false // Cannot see other departments
}
```

### Manager Access Pattern
```typescript
// Example: Jane Smith (Manager, Technical Department)
const managerAccess = {
  departments: ["Technical"], // Only own department
  budgetOperations: {
    create: true,  // Can add budget items to own dept
    read: true,    // Can view own dept budget items
    update: true,  // Can edit own dept budget items
    delete: true   // Can delete budget items in own dept
  },
  crossDepartmentView: false, // Cannot see other departments
  approvalWorkflow: true,     // Can approve budget requests in own dept
  departmentSettings: true    // Can modify some department settings
}
```

### Admin Access Pattern
```typescript
// Example: System Admin
const adminAccess = {
  departments: ["*"], // All departments
  budgetOperations: {
    create: true,  // Can add budget items anywhere
    read: true,    // Can view all budget items
    update: true,  // Can edit all budget items
    delete: true   // Can delete any budget items
  },
  crossDepartmentView: true, // Full system view
  systemManagement: true,    // Can manage users, settings, etc.
  dataExport: true          // Can export all data
}
```

## Sidebar Navigation by Role

### Employee Sidebar
```typescript
const employeeSidebar = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { 
    icon: DollarSign, 
    label: "Budget", 
    submenu: [
      { icon: Plus, label: "Add Budget", href: "/budget/add" },
      { icon: List, label: "Budget List", href: "/budget/list" }
    ]
  },
  { icon: BarChart3, label: "My Analytics", href: "/analytics/department" },
  { icon: FileText, label: "My Reports", href: "/reports/department" },
  { icon: Settings, label: "Profile", href: "/settings/profile" }
]
```

### Manager Sidebar
```typescript
const managerSidebar = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { 
    icon: DollarSign, 
    label: "Budget", 
    submenu: [
      { icon: Plus, label: "Add Budget", href: "/budget/add" },
      { icon: List, label: "Budget List", href: "/budget/list" },
      { icon: BarChart3, label: "Budget Reports", href: "/budget/reports" }
    ]
  },
  { icon: Users, label: "My Team", href: "/team" }, // Only own department team
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" }
]
```

### Admin Sidebar
```typescript
const adminSidebar = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { 
    icon: DollarSign, 
    label: "Budget", 
    submenu: [
      { icon: Plus, label: "Add Budget", href: "/budget/add" },
      { icon: List, label: "Budget List", href: "/budget/list" },
      { icon: BarChart3, label: "Budget Reports", href: "/budget/reports" },
      { icon: Settings, label: "Budget Settings", href: "/budget/settings" }
    ]
  },
  { icon: Users, label: "User Management", href: "/users" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Settings, label: "System Settings", href: "/settings" }
]
```

## Implementation Examples

### 1. Route Protection
```typescript
// middleware.ts
export function checkRouteAccess(user: User, route: string): boolean {
  const roleAccess = {
    employee: [
      '/dashboard',
      '/budget/add',
      '/budget/list', // Now employees can access budget list (filtered to own dept)
      '/analytics/department',
      '/reports/department',
      '/settings/profile'
    ],
    manager: [
      '/dashboard',
      '/budget/add',
      '/budget/list', // Manager sees own department list
      '/budget/reports',
      '/team', // Own department team only
      '/analytics',
      '/reports',
      '/settings'
    ],
    admin: ['*'] // All routes
  }
  
  return roleAccess[user.role].some(allowedRoute => 
    allowedRoute === '*' || route.startsWith(allowedRoute.replace('*', ''))
  )
}
```

### 2. Data Filtering
```typescript
// lib/data-access.ts
export function filterDataByRole(user: User, data: any[]): any[] {
  switch (user.role) {
    case 'employee':
      return data.filter(item => item.department === user.department)
    
    case 'manager':
      return data.filter(item => item.department === user.department) // Only own department
    
    case 'admin':
      return data // No filtering
    
    default:
      return []
  }
}
```

### 3. Component Access Control
```typescript
// components/AccessControl.tsx
interface AccessControlProps {
  requiredRole: 'employee' | 'manager' | 'admin'
  requiredDepartment?: string
  children: React.ReactNode
}

export function AccessControl({ requiredRole, requiredDepartment, children }: AccessControlProps) {
  const { user } = useUser()
  
  if (!user) return <LoginRequired />
  
  // Check role hierarchy
  const roleHierarchy = { employee: 1, manager: 2, admin: 3 }
  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    return <AccessDenied />
  }
  
  // Check department access for both employee and manager
  if (requiredDepartment && (user.role === 'employee' || user.role === 'manager') && user.department !== requiredDepartment) {
    return <AccessDenied />
  }
  
  return <>{children}</>
}
```

## Adding New Modules

When adding new modules, follow this checklist:

### 1. Define Access Rules
```typescript
// Add to ROLE_ACCESS_GUIDE.md
| New Module | Employee | Manager | Admin | Notes |
|------------|----------|---------|-------|-------|
| Inventory  | ✅ Own Dept | ✅ Own Dept | ✅ All Depts | Department-specific inventory |
```

### 2. Update Route Protection
```typescript
// Add routes to middleware.ts
const newModuleRoutes = {
  employee: ['/inventory/department'],
  manager: ['/inventory/department'], // Manager also limited to own department
  admin: ['/inventory/*']
}
```

### 3. Update Sidebar Navigation
```typescript
// Add to appropriate sidebar configurations
const inventoryMenuItem = {
  icon: Package,
  label: "Inventory",
  href: user.role === 'employee' ? '/inventory/department' : '/inventory'
}
```

### 4. Create Access-Controlled Components
```typescript
// components/inventory/InventoryAccess.tsx
export function InventoryAccess() {
  const { user } = useUser()
  
  return (
    <AccessControl requiredRole="employee">
      {user.role === 'employee' ? (
        <DepartmentInventory department={user.department} />
      ) : (
        <AllInventory />
      )}
    </AccessControl>
  )
}
```

## Configuration File

Create a centralized configuration for easy management:

```typescript
// config/role-access.ts
export const ROLE_ACCESS_CONFIG = {
  modules: {
    dashboard: { employee: 'own', manager: 'own', admin: 'all' },
    budget: { employee: 'own', manager: 'own', admin: 'all' },
    users: { employee: 'none', manager: 'none', admin: 'all' },
    analytics: { employee: 'own', manager: 'own', admin: 'all' },
    reports: { employee: 'own', manager: 'own', admin: 'all' },
    settings: { employee: 'profile', manager: 'profile+department', admin: 'system' }
  },
  
  operations: {
    create: { employee: 'own', manager: 'own', admin: 'all' },
    read: { employee: 'own', manager: 'own', admin: 'all' },
    update: { employee: 'own', manager: 'own', admin: 'all' },
    delete: { employee: 'none', manager: 'own', admin: 'all' }
  }
}
```

## Usage Instructions

1. **To add a new user role**: Update the User interface and add role-specific access rules
2. **To add a new module**: Follow the "Adding New Modules" checklist above
3. **To modify access**: Update the ROLE_ACCESS_CONFIG and corresponding components
4. **To test access**: Use the AccessControl component wrapper around protected content

This guide provides a flexible foundation for managing role-based access that can be easily extended as your application grows.