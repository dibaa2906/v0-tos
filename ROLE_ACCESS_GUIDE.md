# Role-Based Access Control Guide

This guide defines which modules and features each user role can access in the system.

## User Roles

### 1. Employee
- **Description**: Regular staff members who work in a specific department
- **Access Level**: Department-specific, limited CRUD operations
- **Department Restriction**: Can only access their own department's data

### 2. Manager
- **Description**: Department managers or supervisors
- **Access Level**: Multi-department access, full CRUD operations
- **Department Restriction**: Can access multiple departments they manage

### 3. Admin
- **Description**: System administrators with full access
- **Access Level**: System-wide access, all operations
- **Department Restriction**: No restrictions, can access all departments

## Module Access Matrix

| Module               | Employee        | Manager           | Admin              | Notes |
|----------------------|-----------------|-------------------|--------------------|------------|
| **Dashboard**        | ✅ Own Dept     | ✅ All Depts     | ✅ All Depts       | Employee sees department-specific dashboard |
| **Budget - Add**     | ✅ Own Dept     | ✅ All Depts     | ✅ All Depts       | Employee can only add to their department |
| **Budget - List**    | ❌              | ✅               | ✅                 | Employee cannot see cross-department list |
| **Budget - Edit**    | ✅ Own Dept     | ✅ Managed Depts | ✅ All Depts       | Employee can only edit their department items |
| **Budget - Delete**  | ❌              | ✅               | ✅                 | Employee cannot delete budget items |
| **Budget - Reports** | ✅ Own Dept     | ✅ Managed Depts | ✅ All Depts       | Department-specific reports for employees |
| **Users Management** | ❌              | ❌               | ✅                 | Only admins can manage users |
| **Analytics**        | ✅ Own Dept     | ✅ Managed Depts | ✅ All Depts       | Department-specific analytics |
| **Settings**         | ✅ Profile Only | ✅ Dept Settings | ✅ System Settings | Limited settings access for employees |

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
// Example: Jane Smith (Manager, manages Technical + IT)
const managerAccess = {
  departments: ["Technical", "IT"], // Multiple departments
  budgetOperations: {
    create: true,  // Can add budget items to managed depts
    read: true,    // Can view managed depts budget items
    update: true,  // Can edit managed depts budget items
    delete: true   // Can delete budget items in managed depts
  },
  crossDepartmentView: true, // Can see cross-department reports
  approvalWorkflow: true     // Can approve budget requests
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
  { icon: DollarSign, label: "My Budget", href: "/budget/department" },
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
  { icon: Users, label: "Team Management", href: "/team" },
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
      '/budget/department',
      '/analytics/department',
      '/reports/department',
      '/settings/profile'
    ],
    manager: [
      '/dashboard',
      '/budget/*',
      '/team',
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
      return data.filter(item => user.managedDepartments.includes(item.department))
    
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
  
  // Check department access
  if (requiredDepartment && user.role === 'employee' && user.department !== requiredDepartment) {
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
| Inventory  | ✅ Own Dept | ✅ Managed Depts | ✅ All Depts | Department-specific inventory |
```

### 2. Update Route Protection
```typescript
// Add routes to middleware.ts
const newModuleRoutes = {
  employee: ['/inventory/department'],
  manager: ['/inventory/*'],
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
    dashboard: { employee: 'own', manager: 'managed', admin: 'all' },
    budget: { employee: 'own', manager: 'managed', admin: 'all' },
    users: { employee: 'none', manager: 'none', admin: 'all' },
    analytics: { employee: 'own', manager: 'managed', admin: 'all' },
    reports: { employee: 'own', manager: 'managed', admin: 'all' },
    settings: { employee: 'profile', manager: 'department', admin: 'system' }
  },
  
  operations: {
    create: { employee: 'own', manager: 'managed', admin: 'all' },
    read: { employee: 'own', manager: 'managed', admin: 'all' },
    update: { employee: 'own', manager: 'managed', admin: 'all' },
    delete: { employee: 'none', manager: 'managed', admin: 'all' }
  }
}
```

## Usage Instructions

1. **To add a new user role**: Update the User interface and add role-specific access rules
2. **To add a new module**: Follow the "Adding New Modules" checklist above
3. **To modify access**: Update the ROLE_ACCESS_CONFIG and corresponding components
4. **To test access**: Use the AccessControl component wrapper around protected content

This guide provides a flexible foundation for managing role-based access that can be easily extended as your application grows.