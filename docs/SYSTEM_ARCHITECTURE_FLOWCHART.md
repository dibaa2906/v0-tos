# 🏗️ Overall System Architecture Flowchart

This document contains flowcharts showing the complete system architecture of the Intern Attendance System.

## 📊 System Architecture Overview

```mermaid
flowchart TB
    subgraph "Frontend Layer"
        Home[Home Page<br/>Landing]
        Login[Login Page]
        Signup[Signup Page]
        Dashboard[Intern Dashboard]
        AdminDash[Admin Dashboard]
    end

    subgraph "Authentication"
        AuthGuard[Auth Guard<br/>Middleware]
        CookieAuth[HTTP-Only Cookies]
        LocalStorage[Local Storage<br/>Client State]
    end

    subgraph "API Routes Layer"
        AuthAPI["/api/auth/*<br/>Login, Signup, Profile"]
        AttendanceAPI["/api/attendance<br/>Clock In/Out"]
        LogsAPI["/api/logs<br/>Volume Logs"]
        LeavesAPI["/api/leaves<br/>Leave Applications"]
        ReportsAPI["/api/reports<br/>Attendance Reports"]
        InternsAPI["/api/auth/interns<br/>Intern Management"]
    end

    subgraph "Business Logic Layer"
        AuthLib[lib/auth.ts<br/>Authentication]
        AttendanceLib[lib/attendance.ts<br/>Attendance Logic]
        EmailLib[lib/email.ts<br/>Email Service]
        FaceRec[lib/face-recognition.ts<br/>Face Verification]
        PDFExport[lib/pdf-export.ts<br/>PDF Generation]
    end

    subgraph "Data Access Layer"
        DB[lib/db.ts<br/>Database Connection]
        DBUtils[lib/db-utils.ts<br/>Database Operations]
    end

    subgraph "Database"
        UsersTable[(users<br/>Intern Data)]
        AttendanceTable[(attendance<br/>Clock Records)]
        LogsTable[(volume_logs<br/>Daily Logs)]
        LeavesTable[(leave_applications<br/>Leave Requests)]
    end

    subgraph "External Services"
        EmailService[Email Service<br/>Gmail/SMTP]
        SMSService[SMS Service<br/>Twilio Optional]
        Camera[Camera API<br/>Photo Capture]
        Geolocation[Geolocation API<br/>Location Check]
    end

    %% User Flow
    Home -->|Not Authenticated| Login
    Home -->|Not Authenticated| Signup
    Login -->|Success| AuthGuard
    Signup -->|Success| AuthGuard
    AuthGuard -->|Valid| CookieAuth
    AuthGuard -->|Admin| AdminDash
    AuthGuard -->|Intern| Dashboard
    CookieAuth --> LocalStorage

    %% API Connections
    Dashboard --> AuthAPI
    Dashboard --> AttendanceAPI
    Dashboard --> LogsAPI
    Dashboard --> LeavesAPI
    AdminDash --> InternsAPI
    AdminDash --> LeavesAPI
    AdminDash --> ReportsAPI
    AdminDash --> AttendanceAPI
    AdminDash --> LogsAPI

    %% Business Logic
    AuthAPI --> AuthLib
    AuthAPI --> EmailLib
    AttendanceAPI --> AttendanceLib
    AttendanceAPI --> FaceRec
    LogsAPI --> DBUtils
    LeavesAPI --> DBUtils
    ReportsAPI --> DBUtils
    ReportsAPI --> PDFExport
    InternsAPI --> DBUtils

    %% Data Layer
    AuthLib --> DBUtils
    AttendanceLib --> DBUtils
    DBUtils --> DB
    DB --> UsersTable
    DB --> AttendanceTable
    DB --> LogsTable
    DB --> LeavesTable

    %% External Services
    EmailLib --> EmailService
    AuthLib --> SMSService
    AttendanceLib --> Camera
    AttendanceLib --> Geolocation

    style Home fill:#40e0d0
    style Dashboard fill:#40e0d0
    style AdminDash fill:#40e0d0
    style DB fill:#ff6b6b
    style UsersTable fill:#ffd93d
    style AttendanceTable fill:#ffd93d
    style LogsTable fill:#ffd93d
    style LeavesTable fill:#ffd93d
```

## 🔄 Complete User Journey Flow

```mermaid
flowchart TD
    Start([User Visits System]) --> CheckAuth{Authenticated?}
    
    CheckAuth -->|No| HomePage[Home Page]
    CheckAuth -->|Yes| CheckRole{User Role?}
    
    HomePage --> ChooseAction{Choose Action}
    ChooseAction -->|Sign Up| SignupFlow[Signup Process]
    ChooseAction -->|Login| LoginFlow[Login Process]
    
    SignupFlow --> FillForm[Fill Registration Form]
    FillForm --> EmailVerify[Email Verification]
    EmailVerify -->|Code Valid| CreateAccount[Create Account]
    EmailVerify -->|Invalid| EmailVerify
    CreateAccount --> LoginFlow
    
    LoginFlow --> EnterCreds[Enter Username/Password]
    EnterCreds --> ValidateCreds{Valid?}
    ValidateCreds -->|No| LoginFlow
    ValidateCreds -->|Yes| SetSession[Set Session Cookies]
    SetSession --> CheckRole
    
    CheckRole -->|Admin| AdminDashboard[Admin Dashboard]
    CheckRole -->|Intern| InternDashboard[Intern Dashboard]
    
    %% Admin Flows
    AdminDashboard --> AdminFeatures{Admin Action}
    AdminFeatures -->|Manage Interns| InternMgmt[Intern Management]
    AdminFeatures -->|Review Leaves| LeaveReview[Leave Review Queue]
    AdminFeatures -->|View Reports| Reports[Attendance Reports]
    AdminFeatures -->|View Attendance| AttendanceView[Attendance Logs]
    
    %% Intern Flows
    InternDashboard --> InternFeatures{Intern Action}
    InternFeatures -->|Clock In/Out| Attendance[Clock In/Out]
    InternFeatures -->|Volume Logs| VolumeLogs[Write Volume Logs]
    InternFeatures -->|Apply Leave| LeaveApplication[Submit Leave Request]
    InternFeatures -->|View History| History[Attendance History]
    InternFeatures -->|View Profile| Profile[Profile Management]
    
    %% Attendance Flow
    Attendance --> CheckLocation[Check Location]
    CheckLocation -->|Valid| CapturePhoto[Capture Photo]
    CheckLocation -->|Invalid| LocationError[Show Location Error]
    CapturePhoto --> VerifyFace{Face Verified?}
    VerifyFace -->|Yes| RecordAttendance[Record Attendance]
    VerifyFace -->|No| FaceError[Show Face Error]
    RecordAttendance --> InternDashboard
    
    %% Volume Logs Flow
    VolumeLogs --> CheckTime{Time Valid?<br/>8AM-7PM}
    CheckTime -->|Yes| WriteLog[Write/Edit Log]
    CheckTime -->|No| TimeError[Show Time Error]
    WriteLog --> SaveLog[Save Log]
    SaveLog --> InternDashboard
    
    %% Leave Application Flow
    LeaveApplication --> FillLeaveForm[Fill Leave Form]
    FillLeaveForm --> SubmitLeave[Submit Request]
    SubmitLeave --> PendingStatus[Status: Pending]
    PendingStatus --> AdminReview[Admin Reviews]
    AdminReview --> ApprovalDecision{Approved?}
    ApprovalDecision -->|Yes| ApprovedStatus[Status: Approved]
    ApprovalDecision -->|No| RejectedStatus[Status: Rejected]
    ApprovedStatus --> InternDashboard
    RejectedStatus --> InternDashboard
    
    InternMgmt --> InternDashboard
    LeaveReview --> AdminDashboard
    Reports --> AdminDashboard
    AttendanceView --> AdminDashboard
    History --> InternDashboard
    Profile --> InternDashboard
    
    LocationError --> Attendance
    FaceError --> Attendance
    TimeError --> InternDashboard
    
    style Start fill:#40e0d0
    style AdminDashboard fill:#40e0d0
    style InternDashboard fill:#40e0d0
    style RecordAttendance fill:#95e1d3
    style SaveLog fill:#95e1d3
    style ApprovedStatus fill:#95e1d3
    style RejectedStatus fill:#ff6b6b
```

## 🗄️ Database Schema Flow

```mermaid
erDiagram
    USERS ||--o{ ATTENDANCE : "has"
    USERS ||--o{ VOLUME_LOGS : "writes"
    USERS ||--o{ LEAVE_APPLICATIONS : "submits"

    USERS {
        string id PK
        string fullName
        string username UK
        string email
        string phoneNumber
        string address
        string department
        string emergencyContactName
        string emergencyContactPhone
        string password
        string profilePhoto
        int isAdmin
        int isActive
        datetime createdAt
    }

    ATTENDANCE {
        string id PK
        string userId FK
        string date
        string clockInTime
        string clockOutTime
        string clockInPhoto
        string clockOutPhoto
        string clockInLocation
        string clockOutLocation
        string status
        datetime createdAt
    }

    VOLUME_LOGS {
        string id PK
        string userId FK
        string date
        text content
        datetime createdAt
    }

    LEAVE_APPLICATIONS {
        string id PK
        string userId FK
        string startDate
        string endDate
        string reason
        string status
        string reviewerNote
        datetime createdAt
        datetime updatedAt
    }
```

## 🔐 Authentication & Authorization Flow

```mermaid
flowchart LR
    subgraph "Client Side"
        Request[User Request]
        AuthGuardComp[AuthGuard Component]
        AdminGuardComp[AdminGuard Component]
        LocalStorage[LocalStorage Check]
    end

    subgraph "Server Side"
        Middleware[Middleware.ts]
        CookieCheck[Cookie Validation]
        RouteProtection[Route Protection]
    end

    subgraph "Database"
        UserLookup[User Lookup]
        RoleCheck[Role Check]
    end

    Request --> AuthGuardComp
    AuthGuardComp -->|Client Check| LocalStorage
    LocalStorage -->|Not Found| Middleware
    
    Request --> Middleware
    Middleware --> CookieCheck
    CookieCheck -->|Valid Cookie| RouteProtection
    CookieCheck -->|Invalid| Redirect[Redirect to Home]
    
    RouteProtection -->|Admin Route| AdminGuardComp
    RouteProtection -->|Intern Route| AuthGuardComp
    
    AdminGuardComp -->|Check isAdmin| UserLookup
    UserLookup --> RoleCheck
    RoleCheck -->|Admin| Allow[Allow Access]
    RoleCheck -->|Not Admin| RedirectIntern[Redirect to Dashboard]
    
    AuthGuardComp -->|Authenticated| Allow
    AuthGuardComp -->|Not Authenticated| Redirect

    style Middleware fill:#ff6b6b
    style CookieCheck fill:#ffd93d
    style Allow fill:#95e1d3
    style Redirect fill:#ff6b6b
```

## 📱 API Request Flow

```mermaid
sequenceDiagram
    participant Client as Client Browser
    participant Middleware as Middleware
    participant API as API Route
    participant Lib as Business Logic
    participant DB as Database
    participant External as External Service

    Client->>Middleware: HTTP Request
    Middleware->>Middleware: Check Cookies
    alt Not Authenticated
        Middleware->>Client: Redirect to Home
    else Authenticated
        Middleware->>API: Forward Request
        API->>Lib: Call Business Logic
        Lib->>DB: Query/Update Data
        DB-->>Lib: Return Data
        alt Needs External Service
            Lib->>External: Call Service (Email/SMS)
            External-->>Lib: Response
        end
        Lib-->>API: Processed Data
        API->>Client: JSON Response
    end
```

## 🎯 Feature-Specific Flows

### Attendance Clock In/Out Flow

```mermaid
flowchart TD
    Start([User Clicks Clock In/Out]) --> CheckStatus{Already Clocked In?}
    
    CheckStatus -->|No| RequestLocation[Request Location]
    CheckStatus -->|Yes| RequestLocationOut[Request Location for Clock Out]
    
    RequestLocation --> LocationValid{Location Valid?<br/>Within 100m}
    RequestLocationOut --> LocationValid
    
    LocationValid -->|No| ShowError[Show Location Error]
    LocationValid -->|Yes| RequestCamera[Request Camera Access]
    
    RequestCamera --> CameraAllowed{Camera Allowed?}
    CameraAllowed -->|No| ShowCameraError[Show Camera Error]
    CameraAllowed -->|Yes| CapturePhoto[Capture Photo]
    
    CapturePhoto --> VerifyFace[Verify Face Recognition]
    VerifyFace --> FaceValid{Face Valid?}
    
    FaceValid -->|No| ShowFaceError[Show Face Error]
    FaceValid -->|Yes| CheckTime{Current Time}
    
    CheckTime -->|Before 8AM| StatusOnTime[Status: On Time]
    CheckTime -->|After 8AM| StatusLate[Status: Late]
    
    StatusOnTime --> RecordDB[Record to Database]
    StatusLate --> RecordDB
    
    RecordDB --> Success[Show Success Message]
    Success --> RefreshDashboard[Refresh Dashboard]
    
    ShowError --> Start
    ShowCameraError --> Start
    ShowFaceError --> Start
    
    style Start fill:#40e0d0
    style RecordDB fill:#95e1d3
    style Success fill:#95e1d3
    style ShowError fill:#ff6b6b
    style ShowCameraError fill:#ff6b6b
    style ShowFaceError fill:#ff6b6b
```

### Volume Logs Flow

```mermaid
flowchart TD
    Start([Access Volume Logs]) --> CheckTime{Current Time<br/>8AM-7PM?}
    
    CheckTime -->|No| ShowTimeError[Show: Only accessible 8AM-7PM]
    CheckTime -->|Yes| CheckExisting{Log Exists Today?}
    
    CheckExisting -->|Yes| LoadLog[Load Existing Log]
    CheckExisting -->|No| NewLog[Create New Log]
    
    LoadLog --> CheckEditable{Before 7PM?}
    CheckEditable -->|No| ReadOnly[Read-Only Mode]
    CheckEditable -->|Yes| EditMode[Edit Mode]
    
    NewLog --> EditMode
    EditMode --> UserEdit[User Edits Content]
    UserEdit --> SaveClick[User Clicks Save]
    
    SaveClick --> ValidateTime{Still Before 7PM?}
    ValidateTime -->|No| SaveError[Error: Cannot edit after 7PM]
    ValidateTime -->|Yes| SaveToDB[Save to Database]
    
    SaveToDB --> Success[Show Success]
    Success --> UpdateTable[Update All Logs Table]
    
    ReadOnly --> ViewOnly[View Past Logs]
    UpdateTable --> ViewOnly
    
    ShowTimeError --> End([End])
    SaveError --> EditMode
    ViewOnly --> End
    
    style Start fill:#40e0d0
    style SaveToDB fill:#95e1d3
    style Success fill:#95e1d3
    style SaveError fill:#ff6b6b
    style ReadOnly fill:#ffd93d
```

### Leave Application Review Flow

```mermaid
flowchart TD
    Start([Admin Opens Leave Review]) --> LoadPending[Load Pending Requests]
    LoadPending --> DisplayTable[Display in Table]
    
    DisplayTable --> AdminAction{Admin Action}
    
    AdminAction -->|Select Multiple| BulkSelect[Bulk Selection]
    AdminAction -->|Select Single| SingleSelect[Select One]
    AdminAction -->|Review Detail| ViewDetail[View Application Details]
    
    BulkSelect --> BulkAction{Choose Action}
    BulkAction -->|Approve| BulkApprove[Approve Multiple]
    BulkAction -->|Reject| BulkReject[Reject Multiple]
    
    SingleSelect --> SingleAction{Choose Action}
    SingleAction -->|Approve| ApproveModal[Open Approve Modal]
    SingleAction -->|Reject| RejectModal[Open Reject Modal]
    
    ApproveModal --> AddNoteApprove[Add Reviewer Note]
    AddNoteApprove --> ConfirmApprove[Confirm Approval]
    ConfirmApprove --> UpdateStatusApproved[Update Status: Approved]
    
    RejectModal --> AddNoteReject[Add Reviewer Note]
    AddNoteReject --> ConfirmReject[Confirm Rejection]
    ConfirmReject --> UpdateStatusRejected[Update Status: Rejected]
    
    BulkApprove --> BulkApproveModal[Add Note for All]
    BulkApproveModal --> BulkUpdateApprove[Update All to Approved]
    
    BulkReject --> BulkRejectModal[Add Note for All]
    BulkRejectModal --> BulkUpdateReject[Update All to Rejected]
    
    UpdateStatusApproved --> NotifyUser[Notify Intern]
    UpdateStatusRejected --> NotifyUser
    BulkUpdateApprove --> NotifyUser
    BulkUpdateReject --> NotifyUser
    
    NotifyUser --> RefreshTable[Refresh Table]
    RefreshTable --> DisplayTable
    
    ViewDetail --> DisplayTable
    
    style Start fill:#40e0d0
    style UpdateStatusApproved fill:#95e1d3
    style UpdateStatusRejected fill:#ff6b6b
    style NotifyUser fill:#95e1d3
```

## 📝 How to View These Flowcharts

### Option 1: GitHub (Recommended)
- Push this file to GitHub
- GitHub automatically renders Mermaid diagrams
- View directly in the repository

### Option 2: VS Code
- Install "Markdown Preview Mermaid Support" extension
- Open this file in VS Code
- Use Markdown preview to view

### Option 3: Online Viewer
- Go to https://mermaid.live
- Copy and paste the mermaid code blocks
- View and export as PNG/SVG

### Option 4: Mermaid CLI
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i SYSTEM_ARCHITECTURE_FLOWCHART.md -o flowchart.png
```

## 🔧 Customizing Flowcharts

To edit these flowcharts:

1. **Modify the Mermaid code** - Edit the code blocks starting with ````mermaid`
2. **Add new nodes** - Use syntax like `NodeName[Label]`
3. **Add connections** - Use `-->` for arrows
4. **Add styling** - Use `style NodeName fill:#color`
5. **Add subgraphs** - Group related components

### Quick Reference:
```mermaid
flowchart TD
    Start([Start]) --> Process[Process]
    Process --> Decision{Decision?}
    Decision -->|Yes| Action1[Action 1]
    Decision -->|No| Action2[Action 2]
    Action1 --> End([End])
    Action2 --> End
    
    style Start fill:#40e0d0
    style End fill:#40e0d0
```

## 📚 Additional Resources

- **Mermaid Documentation**: https://mermaid.js.org/
- **Flowchart Symbols Guide**: See FLOWCHART_GUIDE.md
- **Mermaid Live Editor**: https://mermaid.live

---

**Last Updated**: November 2025  
**System Version**: v1.0



