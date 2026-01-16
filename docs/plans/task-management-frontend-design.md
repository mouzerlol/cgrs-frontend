# Task Management System - Frontend Design Document

**Version:** 1.1 (Refined)  
**Date:** January 2025  
**Status:** Draft - For Review

---

## 1. Executive Summary

This document outlines the frontend design for a task management system inspired by Asana, Jira, and Trello. The system enables CGRS community members to report issues (gardening, maintenance, security, etc.) while allowing body corp managers and staff to track, prioritize, and resolve these issues through an intuitive Kanban board interface.

### Core Design Philosophy

- **Community-First Accessibility**: The system must be welcoming for non-technical users while powerful for staff
- **Visual Workflow Clarity**: Kanban boards provide immediate understanding of issue status
- **Progressive Disclosure**: Simple for basic use, advanced features available as needed
- **Design System Alignment**: All components follow the established CGRS visual language (bone, forest, terracotta, sage)

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Task Management System                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────────────────────────────────────┐    │
│  │   Member    │───►│  Issue Reporting Form (modal or page)       │    │
│  │   Reports   │    │  → Category → Location → Description        │    │
│  └─────────────┘    └─────────────────────────────────────────────┘    │
│                            │                                            │
│                            ▼                                            │
│  ┌─────────────┐    ┌─────────────────────────────────────────────┐    │
│  │   Staff     │◄───│  Kanban Board View                          │    │
│  │   Manages   │    │  → Drag & Drop → Status Updates → Comments  │    │
│  └─────────────┘    └─────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Experience Design

### 2.1 User Roles and Permissions Matrix

| Role | Report Issues | View All | Assign Tasks | Change Status | Manage Columns | Delete | Analytics |
|------|---------------|----------|--------------|---------------|----------------|--------|-----------|
| **Member** | ✅ Own only | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Staff** | ✅ | ✅ | ✅ Own/assigned | ✅ | ❌ | ❌ | View only |
| **Manager** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Full access |
| **Committee** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | View only |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Full access |

### 2.2 Primary User Flows

#### Flow A: Member Reporting an Issue

```
┌──────────────────────────────────────────────────────────────────────┐
│  Step 1: Access Form                                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Header Navigation → "Report Issue" → Modal Opens              │ │
│  │  Alternative: /tasks/new page                                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Step 2: Category Selection (Visual Cards)                     │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │ │
│  │  │ 🏡 Bldg │ │ 🌿 Garden│ │ 🔒 Sec  │ │ 🧹 Clean │              │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │ │
│  │  │ 👥 Noise│ │ ♿ Access│ │ 🚗 Park │ │ 🏢 Facilities│          │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Step 3: Details Form                                          │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ Title*: [Enter a descriptive title...]    [0/100]        │ │ │
│  │  ├──────────────────────────────────────────────────────────┤ │ │
│  │  │ 📍 Location*: [Select from predefined...] + [Custom]     │ │ │
│  │  ├──────────────────────────────────────────────────────────┤ │ │
│  │  │ 📝 Description*: [Describe the issue...]    [0/1000]     │ │ │
│  │  │                                                          │ │ │
│  │  │ 💡 Tips: Include when it started, impact, location       │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Step 4: Photos & Priority                                     │ │
│  │  📷 [Drag photos here or click to upload]                     │ │
│  │     Supports: JPG, PNG, WebP (max 10MB, 5 photos)             │ │
│  │                                                               │ │
│  │  ⚡ Priority: 🟢 Low  🔵 Medium  🟠 High  🔴 Urgent           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Step 5: Review & Submit                                       │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ ✅ Summary Preview                                        │ │ │
│  │  │ 🏷️ Gardening • High Priority                             │ │ │
│  │  │ 📍 Back Lane - Near BBQ Area                             │ │ │
│  │  │ 📝 Sprinkler head broken, creating slip hazard           │ │ │
│  │  │ 📷 2 photos attached                                     │ │ │
│  │  ├──────────────────────────────────────────────────────────┤ │ │
│  │  │ [Cancel]                           [Submit Issue]        │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Step 6: Confirmation                                          │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │                    ✅ Issue Submitted!                    │ │ │
│  │  │                                                            │ │ │
│  │  │  Your ticket number: TKT-047                              │ │ │
│  │  │  Expected response: Within 24 hours                       │ │ │
│  │  │                                                            │ │ │
│  │  │  [View My Ticket]  [Submit Another Issue]                 │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
```

#### Flow B: Staff Managing the Board

```
┌──────────────────────────────────────────────────────────────────────┐
│  STAFF DASHBOARD - Kanban Board                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─ Filters & Search ─────────────────────────────────────────────┐  │
│  │ [🔍 Search tickets...] [📋 Category ▼] [👤 Assignee ▼] [📅]   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │    NEW      │  │   TRIAGED   │  │ IN PROGRESS │  │   PENDING   │ │
│  │   (5)       │  │   (3)       │  │   (8)       │  │   (2)       │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤ │
│  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │ │
│  │  │ TKT-1 │  │  │  │ TKT-6 │  │  │  │ TKT-9 │  │  │  │TKT-14 │  │ │
│  │  │ Broken│  │  │  │ Noise │  │  │  │ Garden│  │  │  │Waiting│  │ │
│  │  │ tap   │  │  │  │ complaint│  │  │  │ lights│  │  │  │parts  │  │ │
│  │  │ 🔴 H  │  │  │  │ 🟠 M  │  │  │  │ 🟠 M  │  │  │  │ 🟢 L  │  │ │
│  │  │ [Avatar]│  │  │  │ [Unassigned]│  │  │  │👤 Mike│  │  │  │👤 Lisa│  │ │
│  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │ │
│  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │  │  └───────┘  │ │
│  │  │ TKT-2 │  │  │  │ TKT-7 │  │  │  │TKT-10 │  │  │             │ │
│  │  │ Garden│  │  │  │ Gate  │  │  │  │Pool   │  │  │             │ │
│  │  │ lights│  │  │  │ sensor│  │  │  │filter │  │  │             │ │
│  │  │ 🟠 M  │  │  │  │ 🔴 H  │  │  │  │ 🟢 L  │  │  │             │ │
│  │  │ [Unassigned]│  │  │👤 John│  │  │  │👤 Mike│  │  │             │ │
│  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │  │             │ │
│  │             │  │             │  │  ┌───────┐  │  │             │ │
│  │             │  │             │  │  │TKT-11 │  │  │             │ │
│  │             │  │             │  │  │BBQ    │  │  │             │ │
│  │             │  │             │  │  │repair │  │  │             │ │
│  │             │  │             │  │  │ 🟢 L  │  │  │             │ │
│  │             │  │             │  │  │👤 Lisa│  │  │             │ │
│  │             │  │             │  │  └───────┘  │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐                                     │
│  │   RESOLVED  │  │    CLOSED   │                                     │
│  │   (12)      │  │   (47)      │                                     │
│  ├─────────────┤  ├─────────────┤                                     │
│  │  ┌───────┐  │  │  ┌───────┐  │                                     │
│  │  │TKT-5  │  │  │  │TKT-3  │  │                                     │
│  │  │Fixed  │  │  │  │ Light │  │                                     │
│  │  │tap    │  │  │  │bulb   │  │                                     │
│  │  │ 🟢 L  │  │  │  │ 🟢 L  │  │                                     │
│  │  │👤 Mike│  │  │  │👤 Mike│  │                                     │
│  │  └───────┘  │  │  └───────┘  │                                     │
│  └─────────────┘  └─────────────┘                                     │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.3 Key Screens and Interactions

#### 2.3.1 Dashboard Overview

**Location:** `/tasks`

**Member View Components:**

```tsx
// DashboardMember.tsx - Conceptual structure
export function DashboardMember() {
  return (
    <div className="space-y-lg">
      {/* Welcome Header */}
      <section className="text-center py-xl">
        <h1 className="font-display text-heading-lg text-forest">
          Welcome back, {userName}
        </h1>
        <p className="text-forest/70 mt-sm">
          Track your reported issues and stay informed
        </p>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-3 gap-md">
        <StatCard 
          label="My Open Issues" 
          count={3}
          icon="folder-open"
          variant="terracotta"
        />
        <StatCard 
          label="Awaiting Response" 
          count={1}
          icon="clock"
          variant="amber"
        />
        <StatCard 
          label="Resolved" 
          count={12}
          icon="check-circle"
          variant="sage"
        />
      </section>

      {/* Quick Actions */}
      <section className="flex justify-center">
        <Button 
          variant="terracotta" 
          size="lg"
          icon="plus"
          onClick={openReportForm}
        >
          Report New Issue
        </Button>
      </section>

      {/* Recent Activity List */}
      <section>
        <h2 className="font-display text-heading-md mb-md">
          My Recent Issues
        </h2>
        <TaskList tasks={recentTasks} variant="compact" />
      </section>
    </div>
  );
}
```

**Staff View Components:**

```tsx
// DashboardStaff.tsx - Conceptual structure
export function DashboardStaff() {
  return (
    <div className="space-y-lg">
      {/* Team Queue Overview */}
      <section>
        <h2 className="font-display text-heading-md mb-md">
          Team Queue
        </h2>
        <div className="grid grid-cols-4 gap-md">
          <QueueCard 
            label="Unassigned"
            count={5}
            priority="high"
            icon="user-plus"
          />
          <QueueCard 
            label="Overdue"
            count={2}
            priority="urgent"
            icon="alert-triangle"
          />
          <QueueCard 
            label="High Priority"
            count={8}
            priority="high"
            icon="flag"
          />
          <QueueCard 
            label="Due Today"
            count={3}
            priority="medium"
            icon="calendar"
          />
        </div>
      </section>

      {/* Quick Filters */}
      <section className="flex gap-sm items-center">
        <FilterChip active>All</FilterChip>
        <FilterChip>Mine</FilterChip>
        <FilterChip>Overdue</FilterChip>
        <FilterChip>High Priority</FilterChip>
        <div className="flex-1" />
        <SearchInput placeholder="Search tickets..." />
      </section>

      {/* Kanban Board (see next section) */}
      <TaskBoard />
    </div>
  );
}
```

#### 2.3.2 Kanban Board View (Primary Staff Interface)

**Layout Structure:**

The board uses horizontal scrolling columns with sticky headers. Each column represents a workflow stage.

**Default Columns with Descriptions:**

| Column | Description | Typical Duration |
|--------|-------------|------------------|
| **New** | Incoming issues awaiting initial review | 0-24 hours |
| **Triaged** | Issues reviewed, categorized, ready for assignment | 24-48 hours |
| **In Progress** | Actively being worked on by staff | 1-7 days |
| **Pending** | Waiting on external factors (parts, contractors, weather) | 1-14 days |
| **Resolved** | Work completed, awaiting reporter confirmation | 24-48 hours |
| **Closed** | Issue confirmed resolved and archived | Permanent |

**Card Design Specification:**

```tsx
// TaskCard.tsx - Full specification
interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const priorityConfig = {
    urgent: { color: 'border-terracotta', icon: 'alert-circle', label: 'Urgent' },
    high: { color: 'border-terracotta', icon: 'flag', label: 'High' },
    medium: { color: 'border-amber', icon: 'minus-circle', label: 'Medium' },
    low: { color: 'border-sage', icon: 'arrow-down-circle', label: 'Low' },
  };

  const priority = priorityConfig[task.priority];

  return (
    <div
      className={cn(
        'bg-white rounded-[16px] p-4',
        'border border-sage/30',
        'transition-all duration-200',
        'hover:shadow-dock hover:-translate-y-1',
        'cursor-pointer',
        isDragging && 'shadow-dock rotate-2 scale-105 z-50',
        task.priority === 'urgent' && 'ring-2 ring-terracotta/20'
      )}
      style={{ borderLeftWidth: '4px', borderLeftColor: priority.color }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Ticket ${task.ticketNumber}: ${task.title}`}
    >
      {/* Header: Category + Ticket Number */}
      <div className="flex items-center justify-between mb-2">
        <Badge variant="sage-light" size="sm">
          {getCategoryIcon(task.category)} {formatCategory(task.category)}
        </Badge>
        <span className="font-mono text-xs text-forest/50">
          {task.ticketNumber}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-body font-medium text-forest mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Location Preview */}
      {task.location && (
        <p className="text-sm text-forest/60 mb-3 flex items-center gap-1">
          <MapPinIcon className="w-3 h-3" />
          <span className="truncate">{task.location}</span>
        </p>
      />

      {/* Footer: Priority + Assignee + Meta */}
      <div className="flex items-center justify-between pt-3 border-t border-sage/20">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
        </div>
        
        {task.assignee ? (
          <Avatar 
            src={task.assignee.avatar} 
            name={task.assignee.name}
            size="sm"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-sage-light flex items-center justify-center">
            <UserPlusIcon className="w-4 h-4 text-forest/50" />
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-3 mt-2 text-xs text-forest/50">
        {task.commentCount > 0 && (
          <span className="flex items-center gap-1">
            <MessageIcon className="w-3 h-3" />
            {task.commentCount}
          </span>
        )}
        {task.attachmentCount > 0 && (
          <span className="flex items-center gap-1">
            <PaperclipIcon className="w-3 h-3" />
            {task.attachmentCount}
          </span>
        )}
        <span className="ml-auto">
          {formatRelativeTime(task.createdAt)}
        </span>
      </div>
    </div>
  );
}
```

**Column Component Specification:**

```tsx
// TaskColumn.tsx
interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TaskColumn({ status, tasks, onTaskClick }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-80 mx-2 first:ml-0 last:mr-0',
        'flex flex-col',
        'bg-sage-light/30 rounded-[24px]',
        'max-h-full',
        isOver && 'bg-sage-light/50 ring-2 ring-terracotta/30'
      )}
    >
      {/* Column Header */}
      <div className="p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-forest">
            {formatStatus(status)}
          </h3>
          <span className="bg-sage text-forest-light px-3 py-1 rounded-full text-sm font-medium">
            {tasks.length}
          </span>
        </div>
        {isOver && (
          <p className="text-sm text-terracotta mt-2 animate-pulse">
            Drop here to move ticket
          </p>
        )}
      </div>

      {/* Column Body - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
        
        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-xl text-forest/40">
            <FolderOpenIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="font-body text-sm">No issues in this stage</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 2.3.3 Issue Reporting Form (Member Experience)

**Form Component Structure:**

```tsx
// TaskReportForm.tsx - Multi-step form with validation
interface TaskReportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaskReportForm({ isOpen, onClose }: TaskReportFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateTaskInput>({});
  const { mutate: createTask, isPending } = useCreateTask();

  const steps = [
    { number: 1, title: 'Category', icon: 'grid' },
    { number: 2, title: 'Details', icon: 'clipboard' },
    { number: 3, title: 'Photos', icon: 'camera' },
    { number: 4, title: 'Review', icon: 'check' },
  ];

  const handleSubmit = () => {
    createTask(formData, {
      onSuccess: (task) => {
        showSuccess(`Ticket ${task.ticketNumber} created!`);
        onClose();
      },
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="xl"
      title="Report an Issue"
    >
      {/* Progress Steps */}
      <div className="flex justify-between mb-lg">
        {steps.map((s) => (
          <StepIndicator 
            key={s.number}
            number={s.number}
            label={s.title}
            isActive={step === s.number}
            isComplete={step > s.number}
          />
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CategorySelector
              value={formData.category}
              onChange={(cat) => setFormData({ ...formData, category: cat })}
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="details" /* ... */>
            <DetailForm
              values={formData}
              onChange={(data) => setFormData({ ...formData, ...data })}
            />
          </motion.div>
        )}
        // ... other steps
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-xl">
        <Button 
          variant="outline" 
          onClick={() => step > 1 ? setStep(step - 1) : onClose()}
        >
          {step > 1 ? 'Back' : 'Cancel'}
        </Button>
        {step < 4 ? (
          <Button variant="terracotta" onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button 
            variant="terracotta" 
            onClick={handleSubmit}
            isLoading={isPending}
          >
            Submit Issue
          </Button>
        )}
      </div>
    </Modal>
  );
}
```

**Category Selection Component:**

```tsx
// CategorySelector.tsx
const categories = [
  { id: 'building_maintenance', label: 'Building', icon: 'home', color: 'terracotta' },
  { id: 'gardening', label: 'Gardening', icon: 'flower', color: 'sage' },
  { id: 'security', label: 'Security', icon: 'shield', color: 'forest' },
  { id: 'cleanliness', label: 'Cleanliness', icon: 'broom', color: 'amber' },
  { id: 'noise', label: 'Noise', icon: 'volume-x', color: 'terracotta' },
  { id: 'accessibility', label: 'Accessibility', icon: 'wheelchair', color: 'sage' },
  { id: 'parking', label: 'Parking', icon: 'car', color: 'forest' },
  { id: 'facilities', label: 'Facilities', icon: 'building', color: 'amber' },
  { id: 'emergency', label: 'Emergency', icon: 'alert-triangle', color: 'terracotta' },
  { id: 'general', label: 'General', icon: 'help-circle', color: 'sage' },
] as const;

export function CategorySelector({ 
  value, 
  onChange 
}: { value?: string; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={cn(
            'p-lg rounded-[20px] border-2 text-center',
            'transition-all duration-200',
            'hover:shadow-dock hover:-translate-y-1',
            value === cat.id 
              ? `border-${cat.color} bg-${cat.color}/5` 
              : 'border-sage/30 bg-white hover:border-sage'
          )}
        >
          <div className={cn(
            'w-12 h-12 mx-auto mb-3 rounded-full',
            `bg-${cat.color}/10 flex items-center justify-center`
          )}>
            <Icon name={cat.icon} className={`text-${cat.color}`} />
          </div>
          <span className="font-body font-medium text-forest">
            {cat.label}
          </span>
        </button>
      ))}
    </div>
  );
}
```

#### 2.3.4 Ticket Detail View (Slide-over Panel)

**Panel Structure:**

```tsx
// TaskDetailPanel.tsx
interface TaskDetailPanelProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailPanel({ task, isOpen, onClose }: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} side="right" width={600}>
      {/* Header */}
      <div className="sticky top-0 bg-bone z-20 pb-md border-b border-sage/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-sm mb-sm">
              <Badge variant="sage-light">{task.ticketNumber}</Badge>
              <Badge variant={getPriorityBadgeVariant(task.priority)}>
                {task.priority}
              </Badge>
            </div>
            <h2 className="font-display text-xl text-forest">
              {task.title}
            </h2>
          </div>
          <div className="flex items-center gap-sm">
            <Button variant="icon" icon="edit" />
            <Button variant="icon" icon="more-horizontal" />
            <Button variant="icon" icon="x" onClick={onClose} />
          </div>
        </div>

        {/* Status Dropdown (moves card between columns) */}
        <div className="mt-md">
          <StatusDropdown
            currentStatus={task.status}
            onChange={(status) => updateTaskStatus(task.id, status)}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-sm mt-md border-b border-sage/20 pb-sm">
        <TabButton active={activeTab === 'details'}>
          Details
        </TabButton>
        <TabButton active={activeTab === 'comments'}>
          Comments ({task.comments.length})
        </TabButton>
        <TabButton active={activeTab === 'activity'}>
          Activity
        </TabButton>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto py-md">
        {activeTab === 'details' && (
          <TaskDetailsSection task={task} />
        )}
        {activeTab === 'comments' && (
          <TaskCommentsSection taskId={task.id} />
        )}
        {activeTab === 'activity' && (
          <TaskActivityLog taskId={task.id} />
        )}
      </div>

      {/* Properties Footer */}
      <div className="sticky bottom-0 bg-bone border-t border-sage/20 pt-md">
        <TaskPropertiesEditor task={task} />
      </div>
    </SlideOver>
  );
}
```

**Task Properties Editor:**

```tsx
// TaskPropertiesEditor.tsx
export function TaskPropertiesEditor({ task }: { task: Task }) {
  const { mutate: updateTask } = useUpdateTask();

  return (
    <div className="grid grid-cols-3 gap-md">
      {/* Assignee */}
      <div>
        <label className="block text-xs font-medium text-forest/60 mb-1">
          Assignee
        </label>
        <AssigneeSelect
          value={task.assigneeId}
          onChange={(id) => updateTask({ id: task.id, assigneeId: id })}
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-xs font-medium text-forest/60 mb-1">
          Priority
        </label>
        <PrioritySelect
          value={task.priority}
          onChange={(p) => updateTask({ id: task.id, priority: p })}
        />
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-xs font-medium text-forest/60 mb-1">
          Due Date
        </label>
        <DatePicker
          value={task.dueDate}
          onChange={(date) => updateTask({ id: task.id, dueDate: date })}
        />
      </div>
    </div>
  );
}
```

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
src/components/tasks/
├── index.ts                        # Barrel export
├── TaskBoard.tsx                   # Main board with DndContext
├── TaskColumn.tsx                  # Column (status stage)
├── TaskCard.tsx                    # Individual ticket card
├── TaskCardMenu.tsx                # Card context menu
├── TaskFilters.tsx                 # Filter and search bar
├── TaskStats.tsx                   # Dashboard statistics
│
├── detail/                         # Detail panel components
│   ├── TaskDetailPanel.tsx         # Slide-over container
│   ├── TaskDetailHeader.tsx        # Header with actions
│   ├── TaskDescription.tsx         # Rich text description
│   ├── TaskPropertiesEditor.tsx    # Assignee, priority, due date
│   ├── TaskAttachments.tsx         # Photo/document list
│   ├── TaskComments.tsx            # Comment thread
│   └── TaskActivityLog.tsx         # Change history
│
├── form/                           # Reporting form components
│   ├── TaskReportForm.tsx          # Multi-step form modal
│   ├── TaskReportCategory.tsx      # Category selection cards
│   ├── TaskReportDetails.tsx       # Title, description, location
│   ├── TaskReportPhotos.tsx        # File upload with preview
│   └── TaskReportReview.tsx        # Summary before submit
│
├── common/                         # Shared components
│   ├── StatusBadge.tsx             # Status indicator
│   ├── PriorityBadge.tsx           # Priority indicator
│   ├── AssigneeAvatar.tsx          # User avatar with fallback
│   ├── CategoryIcon.tsx            # Category icon lookup
│   └── EmptyState.tsx              # Empty column/board states
│
└── hooks/                          # Component-specific hooks
    ├── useTaskDrag.ts              # Drag and drop logic
    ├── useTaskFilters.ts           # Filter state management
    └── useTaskActions.ts           # CRUD operation hooks
```

### 3.2 State Management Architecture

**TanStack Query Keys:**

```typescript
// src/lib/query-keys.ts
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilter) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  stats: () => [...taskKeys.all, 'stats'] as const,
  comments: (taskId: string) => [...taskKeys.all, 'comments', taskId] as const,
  activity: (taskId: string) => [...taskKeys.all, 'activity', taskId] as const,
};
```

**Query Hooks:**

```typescript
// src/hooks/useTasks.ts
export function useTasks(filters?: TaskFilter) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskApi.getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes (formerly cacheTime)
  });
}

export function useTaskDetail(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskApi.getTask(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for detail views
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateTaskInput) => taskApi.updateTask(data),
    onMutate: async (updatedTask) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(updatedTask.id) });
      const previousTask = queryClient.getQueryData(taskKeys.detail(updatedTask.id));
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), (old) => ({
        ...old,
        ...updatedTask,
      }));
      return { previousTask };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      queryClient.setQueryData(taskKeys.detail(newTodo.id), context?.previousTask);
    },
    onSettled: (data, error, newTodo) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(newTodo.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      
      // Snapshot previous value
      const previousLists = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
      
      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old) return old;
        return old.map((task: Task) => 
          task.id === id ? { ...task, status } : task
        );
      });
      
      return { previousLists };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
```

### 3.3 Data Types (TypeScript)

```typescript
// src/types/task.ts

export type TaskStatus = 
  | 'new'
  | 'triaged'
  | 'in_progress'
  | 'pending'
  | 'resolved'
  | 'closed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory = 
  | 'building_maintenance'
  | 'gardening'
  | 'security'
  | 'cleanliness'
  | 'noise'
  | 'accessibility'
  | 'parking'
  | 'facilities'
  | 'emergency'
  | 'general';

export interface Task {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  reporterId: string;
  reporter: TaskReporter;
  attachments: Attachment[];
  commentCount: number;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
}

export interface TaskAssignee {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
}

export interface TaskReporter {
  id: string;
  name: string;
  unit: string;
  avatar: string | null;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  thumbnailUrl: string | null;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ActivityEntry {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  action: string;
  fieldName: string;
  previousValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  assigneeId?: string | null;
  reporterId?: string | null;
  searchQuery?: string;
  dueBefore?: string | null;
  dueAfter?: string | null;
  createdAfter?: string | null;
  createdBefore?: string | null;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  priority?: TaskPriority;
  attachments?: File[];
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  category?: TaskCategory;
  location?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  byCategory: Record<TaskCategory, number>;
  overdueCount: number;
  averageResolutionTimeHours: number;
  createdThisWeek: number;
  resolvedThisWeek: number;
}
```

---

## 4. Design System Integration

### 4.1 Color Application Map

| Element | Tailwind Class | Design Token |
|---------|---------------|--------------|
| Board background | `bg-bone` | `bone` |
| Card background | `bg-white` | white |
| Card border | `border-sage/30` | `sage` at 30% opacity |
| Card hover shadow | `shadow-dock` | Custom shadow |
| High priority indicator | `border-l-4 border-terracotta` | `terracotta` |
| Medium priority indicator | `border-l-4 border-amber` | `amber` |
| Low priority indicator | `border-l-4 border-sage` | `sage` |
| Column header | `bg-sage-light` | `sage-light` |
| Primary actions | `bg-terracotta` | `terracotta` |
| Primary actions hover | `hover:bg-terracotta-dark` | `terracotta-dark` |
| Text primary | `text-forest` | `forest` |
| Text secondary | `text-forest/70` | `forest` at 70% opacity |
| Success indicators | `text-sage` | `sage` |

### 4.2 Typography Scale

| Usage | Tailwind Class | Font | Size | Weight |
|-------|---------------|------|------|--------|
| Board title | `font-display text-heading-lg` | Fraunces | 2-3.5rem | Variable |
| Column header | `font-display text-lg` | Fraunces | 1.25rem | 600 |
| Card title | `font-body text-base font-medium` | Manrope | 1rem | 500 |
| Card meta | `font-body text-sm` | Manrope | 0.875rem | 400 |
| Labels | `font-body text-xs font-medium` | Manrope | 0.75rem | 500 |
| Ticket number | `font-mono text-xs` | Mono | 0.75rem | 400 |

### 4.3 Spacing System

| Token | Rem | Usage |
|-------|-----|-------|
| `xs` | 0.5rem | Inner padding, icon gaps |
| `sm` | 1rem | Card padding, gaps between elements |
| `md` | 1.5rem | Section gaps, column margins |
| `lg` | 2.5rem | Section containers, large gaps |
| `xl` | 4rem | Page sections, headers |
| `2xl` | 6rem | Full page containers |

### 4.4 Component Variants Reference

**TaskCard variants:**

| Variant | Classes | Usage |
|---------|---------|-------|
| `default` | `bg-white border-sage/30` | Standard display |
| `dragging` | `shadow-dock rotate-2 scale-105 z-50` | While being dragged |
| `overdue` | `ring-2 ring-terracotta/30` | Past due date |
| `urgent` | `ring-2 ring-terracotta/50 animate-pulse-slow` | Urgent priority |

**Button variants:**

| Variant | Classes | Usage |
|---------|---------|-------|
| `primary` (terracotta) | `bg-terracotta text-bone hover:bg-terracotta-dark` | Main actions |
| `secondary` (sage) | `bg-sage text-forest hover:bg-sage-dark` | Secondary actions |
| `outline` | `border-2 border-sage text-forest hover:bg-sage-light` | Cancel, back |
| `ghost` | `text-forest hover:bg-sage-light` | Subtle actions |
| `danger` | `bg-terracotta text-white` | Delete, archive |

---

## 5. Implementation Details

### 5.1 Drag and Drop Implementation

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable`

```tsx
// TaskBoard.tsx - Full implementation pattern
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { mutate: moveTask } = useMoveTask();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px drag threshold
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    const overContainer = over.data.current?.sortable?.containerId || over.id;
    
    if (activeTask && activeTask.status !== overContainer) {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === active.id ? { ...t, status: overContainer as TaskStatus } : t
        )
      );
      
      // API call
      moveTask({ id: active.id as string, status: overContainer as TaskStatus });
    }
    
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex overflow-x-auto h-full py-md px-sm">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasks.filter((t) => t.status === column.id)}
            onTaskClick={handleTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <TaskCard
            task={tasks.find((t) => t.id === activeId)!}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### 5.2 Mobile Responsive Strategy

**Breakpoints and Adaptations:**

| Breakpoint | Layout | Column Display | Detail Panel |
|------------|--------|----------------|--------------|
| **≥1280px** (XL) | Full horizontal | All 6 columns visible | Slide-over (600px) |
| **1024-1279px** (LG) | Horizontal scroll | 5 columns, scroll | Slide-over (500px) |
| **768-1023px** (MD) | Horizontal scroll | 4 columns, scroll | Slide-over (70%) |
| **640-767px** (SM) | Single column + tabs | Tab navigation | Full-width bottom sheet |
| **<640px** (XS) | Single column + tabs | Tab navigation | Full-width bottom sheet |

**Mobile Column Navigation:**

```tsx
// MobileColumnNav.tsx
export function MobileColumnNav({ 
  columns, 
  currentColumn, 
  onColumnChange 
}: MobileColumnNavProps) {
  return (
    <div className="sticky top-0 bg-bone z-30 border-b border-sage/20">
      <div className="flex overflow-x-auto gap-sm p-sm scrollbar-hide">
        {columns.map((col) => (
          <button
            key={col.id}
            onClick={() => onColumnChange(col.id)}
            className={cn(
              'flex-shrink-0 px-md py-sm rounded-full',
              'font-body text-sm font-medium',
              'transition-all duration-200',
              currentColumn === col.id
                ? 'bg-forest text-bone'
                : 'bg-sage-light text-forest hover:bg-sage'
            )}
          >
            {col.title}
            <span className="ml-sm bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {col.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Mobile Detail Panel (Bottom Sheet):**

```tsx
// MobileDetailPanel.tsx
export function MobileDetailPanel({ task, isOpen, onClose }: Props) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.5, 0.9, 1]}
    >
      <div className="p-md">
        {/* Header with drag handle */}
        <div className="flex justify-center mb-md">
          <div className="w-12 h-1.5 bg-sage rounded-full" />
        </div>
        
        {/* Content */}
        <TaskDetailContent task={task} />
      </div>
    </BottomSheet>
  );
}
```

### 5.3 Accessibility Implementation

**WCAG 2.1 AA Compliance Checklist:**

- ✅ **Keyboard Navigation**: Full Tab/Shift+Tab support
- ✅ **Focus Indicators**: `ring-2 ring-terracotta` visible on all interactive elements
- ✅ **Screen Reader Support**: ARIA labels on all cards and buttons
- ✅ **Color Independence**: Priority indicators use icons + color
- ✅ **Touch Targets**: Minimum 44x44px tap targets
- ✅ **Reduced Motion**: Respects `prefers-reduced-motion` for animations
- ✅ **Contrast Ratios**: All text meets 4.5:1 minimum ratio
- ✅ **Form Labels**: All form fields have associated labels
- ✅ **Error Messages**: Clear, descriptive error messages with suggestions
- ✅ **Status Announcements**: Live regions for status updates

**ARIA Labels:**

```tsx
// TaskCard with full accessibility
<TaskCard
  role="button"
  tabIndex={0}
  aria-label={`Ticket ${ticket.ticketNumber}: ${ticket.title}`}
  aria-describedby={`card-priority-${ticket.priority}`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }}
>
  <span id={`card-priority-${ticket.priority}`} className="sr-only">
    {ticket.priority} priority
  </span>
  {/* Content */}
</TaskCard>
```

### 5.4 Performance Optimizations

**React Query Configuration:**

```typescript
// Query client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,   // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Optimistic updates for drag operations
const { mutate: moveTask } = useMutation({
  mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
    taskApi.updateStatus(id, status),
  onMutate: async ({ id, status }) => {
    await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
    const previousTasks = queryClient.getQueryData(taskKeys.lists());
    
    queryClient.setQueryData(taskKeys.lists(), (old: Task[]) =>
      old.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
    
    return { previousTasks };
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(taskKeys.lists(), context?.previousTasks);
  },
});
```

**Code Splitting:**

```tsx
// Lazy load heavy components
const TaskDetailPanel = lazy(() => import('./detail/TaskDetailPanel'));
const TaskReportForm = lazy(() => import('./form/TaskReportForm'));

// Usage with Suspense
<Suspense fallback={<TaskDetailSkeleton />}>
  <TaskDetailPanel task={selectedTask} />
</Suspense>
```

**Image Optimization:**

```tsx
// Using Next.js Image for attachments
<Image
  src={attachment.url}
  alt={`Attachment for ${task.ticketNumber}`}
  width={400}
  height={300}
  className="rounded-lg object-cover"
  loading="lazy"
/>
```

---

## 6. Animation Specifications

### 6.1 Animation Tokens

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| `fadeIn` | 200ms | ease-out | Modal appear |
| `fadeOut` | 150ms | ease-in | Modal disappear |
| `slideInRight` | 300ms | out-custom | Slide-over panel |
| `slideOutRight` | 250ms | ease-in | Slide-over close |
| `scaleIn` | 200ms | out-custom | Card appear |
| `drag` | 150ms | ease-out | Card drag feedback |
| `hover` | 200ms | ease-out | Card hover lift |

### 6.2 Framer Motion Variants

```tsx
// src/lib/animations.ts
import { Variants } from 'framer-motion';

export const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  hover: { 
    y: -4, 
    boxShadow: '0 20px 40px rgba(26, 34, 24, 0.12)',
    transition: { duration: 0.2 } 
  },
  drag: {
    scale: 1.05,
    rotate: 2,
    boxShadow: '0 30px 60px rgba(26, 34, 24, 0.2)',
    transition: { duration: 0.1 }
  },
};

export const columnVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, staggerChildren: 0.1 } },
};

export const modalVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
```

---

## 7. Error Handling and Loading States

### 7.1 Loading Skeletons

```tsx
// TaskBoardSkeleton.tsx
export function TaskBoardSkeleton() {
  return (
    <div className="flex gap-md overflow-x-auto p-md">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="flex-shrink-0 w-80">
          <div className="bg-sage-light/50 rounded-[24px] p-4">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((card) => (
                <div key={card} className="bg-white rounded-[16px] p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 7.2 Error Boundaries

```tsx
// TaskErrorBoundary.tsx
export class TaskErrorBoundary extends Component<
  PropsWithChildren,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Task board error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Something went wrong"
          message="Unable to load task board. Please try refreshing."
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}
```

---

## 8. Testing Strategy

### 8.1 Test Coverage Targets

| Component | Unit Tests | Integration Tests |
|-----------|------------|-------------------|
| TaskCard | 8+ tests | 3+ tests |
| TaskColumn | 5+ tests | 2+ tests |
| TaskBoard | 6+ tests | 4+ tests |
| TaskReportForm | 10+ tests | 5+ tests |
| TaskDetailPanel | 7+ tests | 3+ tests |
| API hooks | 8+ tests | 4+ tests |

### 8.2 Example Unit Test

```tsx
// TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';

const mockTask: Task = {
  id: '1',
  ticketNumber: 'TKT-001',
  title: 'Broken sprinkler in Zone B',
  category: 'gardening',
  location: 'Back Lane',
  priority: 'high',
  status: 'new',
  // ... other required fields
};

describe('TaskCard', () => {
  it('renders ticket number and title', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('TKT-001')).toBeInTheDocument();
    expect(screen.getByText('Broken sprinkler in Zone B')).toBeInTheDocument();
  });

  it('shows high priority indicator', () => {
    render(<TaskCard task={mockTask} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveStyle({ borderLeftColor: '#D95D39' }); // terracotta
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<TaskCard task={mockTask} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockTask);
  });

  it('is keyboard accessible', () => {
    render(<TaskCard task={mockTask} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});
```

---

## 9. Definition of Done

- [ ] All components use design system tokens consistently
- [ ] Drag and drop works on desktop (mouse) and mobile (touch)
- [ ] Forms validate input and show clear, actionable errors
- [ ] Accessibility audit passes (axe-core, WCAG 2.1 AA)
- [ ] Responsive design tested on all breakpoints (320px - 1920px)
- [ ] Loading states for all async operations (skeletons + spinners)
- [ ] Error states with recovery options and retry actions
- [ ] Unit tests for all components (80%+ coverage)
- [ ] Integration tests for critical user flows
- [ ] Performance: < 100ms initial load, < 200ms interactions
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)

---

## 10. Future Enhancements (Post-MVP)

| Priority | Feature | Description |
|----------|---------|-------------|
| **P1** | Bulk Actions | Select multiple tickets for batch status updates |
| **P1** | Email Integration | Receive updates via email, reply to comment |
| **P2** | Slack Integration | Notifications to body corp Slack channel |
| **P2** | Analytics Dashboard | Charts showing resolution times, category breakdown |
| **P2** | SLA Tracking | Automatic escalation of overdue tickets |
| **P3** | Templates | Pre-defined issue types with suggested fields |
| **P3** | Recurring Issues | For ongoing maintenance tasks |
| **P3** | Time Tracking | Optional time spent on each issue |
| **P3** | Report Export | CSV/PDF export for committee reports |
| **P4** | Offline Support | Service worker for offline task viewing |

---

**Document Version:** 1.1 (Refined)  
**Last Updated:** January 14, 2025  
**Next Steps:** Backend API & Architecture Design Document (Refined)
