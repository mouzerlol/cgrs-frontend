# Task Management System - Backend API & Architecture Design

**Version:** 1.1 (Refined)  
**Date:** January 2025  
**Status:** Draft - High Level Overview

---

## 1. Executive Summary

This document provides a high-level overview of the backend architecture and API design for the CGRS Task Management System. The system supports community issue reporting with a Kanban-style board for staff workflow management.

**Core Requirements:**
- RESTful API for task CRUD operations
- Role-based access control (Member, Staff, Manager, Committee)
- Real-time updates for board changes
- File attachment support for issue photos
- Integration with existing Next.js 15 frontend

**Architecture Principles:**
- Keep it simple and maintainable
- Leverage existing Next.js 15 App Router
- Use Prisma for type-safe database operations
- NextAuth.js for authentication and authorization
- Socket.io for real-time updates (optional, can start with polling)

---

## 2. High-Level Architecture

### 2.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CGRS Task Management System                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│   │   Frontend   │     │   REST API       │     │    Database      │   │
│   │   (Next.js)  │◄───►│   (Next.js API)  │◄───►│   (PostgreSQL)   │   │
│   │   App Router │     │   Route Handlers │     │   + Prisma ORM   │   │
│   └──────────────┘     └──────────────────┘     └──────────────────┘   │
│         │                       │                       │                │
│         │                       │                       │                │
│         ▼                       ▼                       ▼                │
│   ┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│   │  WebSocket   │     │   Auth Service   │     │   File Storage   │   │
│   │   Server     │     │   (NextAuth.js)  │     │   (Cloudinary)   │   │
│   │  (Socket.io) │     │                  │     │                  │   │
│   └──────────────┘     └──────────────────┘     └──────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 20+ (via Next.js) | App runtime |
| **Framework** | Next.js 15 App Router | API routes + SSR |
| **Database** | PostgreSQL + Prisma | Relational data, type safety |
| **Auth** | NextAuth.js v5 | Session-based auth with roles |
| **Real-time** | Socket.io (optional) | Live board updates |
| **File Storage** | Cloudinary (or S3) | Image/document storage |
| **Validation** | Zod | Runtime type validation |
| **API Style** | REST | Standard RESTful endpoints |

---

## 3. Database Schema

### 3.1 Prisma Schema (PostgreSQL)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USER & AUTH ====================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  unit          String?   // e.g., "Unit 8", "House 12"
  role          Role      @default(MEMBER)
  avatar        String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  tasksReported Task[]    @relation("ReportedTasks")
  tasksAssigned Task[]    @relation("AssignedTasks")
  comments      Comment[]
  activities    ActivityLog[]
  sessions      Session[]
  accounts      Account[]

  @@map("users")
}

enum Role {
  MEMBER
  STAFF
  MANAGER
  COMMITTEE
  ADMIN
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// ==================== TASKS ====================

model Task {
  id            String        @id @default(cuid())
  ticketNumber  String        @unique // e.g., "TKT-047", auto-incrementing
  title         String
  description   String        @db.Text
  category      TaskCategory
  location      String
  priority      TaskPriority  @default(MEDIUM)
  status        TaskStatus    @default(NEW)
  
  reporterId    String
  reporter      User          @relation("ReportedTasks", fields: [reporterId], references: [id])
  
  assigneeId    String?
  assignee      User?         @relation("AssignedTasks", fields: [assigneeId], references: [id])
  
  dueDate       DateTime?
  resolvedAt    DateTime?
  closedAt      DateTime?
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  attachments   Attachment[]
  comments      Comment[]
  activityLog   ActivityLog[]

  @@index([status])
  @@index([assigneeId])
  @@index([priority])
  @@index([reporterId])
  @@index([createdAt])
  @@map("tasks")
}

enum TaskCategory {
  BUILDING_MAINTENANCE
  GARDENING
  SECURITY
  CLEANLINESS
  NOISE
  ACCESSIBILITY
  PARKING
  FACILITIES
  EMERGENCY
  GENERAL
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  NEW
  TRIAGED
  IN_PROGRESS
  PENDING
  RESOLVED
  CLOSED
}

// ==================== ATTACHMENTS & COMMENTS ====================

model Attachment {
  id        String   @id @default(cuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  filename  String
  url       String
  thumbnail String?  // Cloudinary thumbnail URL
  type      String   // "image" or "document"
  size      Int      // bytes
  createdAt DateTime @default(now())

  @@map("attachments")
}

model Comment {
  id        String   @id @default(cuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("comments")
}

// ==================== AUDIT LOG ====================

model ActivityLog {
  id            String   @id @default(cuid())
  taskId        String
  task          Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  action        String   // e.g., "STATUS_CHANGED", "ASSIGNED", "COMMENTED"
  fieldName     String?  // e.g., "status", "priority", "assigneeId"
  previousValue String?
  newValue      String?
  createdAt     DateTime @default(now())

  @@index([taskId])
  @@index([userId])
  @@map("activity_log")
}
```

### 3.2 Database Migrations

```bash
# Generate and run migrations
npx prisma migrate dev --name init_tasks

# Generate Prisma Client
npx prisma generate

# Seed initial data (optional categories, etc.)
npx prisma db seed
```

---

## 4. API Endpoints

### 4.1 RESTful API Design

**Base Path:** `/api/v1/tasks`

**Authentication:** All endpoints require valid session via NextAuth.js

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/tasks` | List tasks (with filters) | All authenticated |
| GET | `/api/v1/tasks/stats` | Dashboard statistics | Staff+ |
| GET | `/api/v1/tasks/:id` | Get single task | All authenticated* |
| POST | `/api/v1/tasks` | Create new task | All authenticated |
| PATCH | `/api/v1/tasks/:id` | Update task (partial) | Staff+ |
| PUT | `/api/v1/tasks/:id/status` | Update task status | Staff+ |
| PUT | `/api/v1/tasks/:id/assign` | Assign/reassign task | Staff+ |
| DELETE | `/api/v1/tasks/:id` | Archive/delete task | Manager+ |

**Members can only see their own tasks in list view. Staff+ can see all tasks.

**Comments & Attachments:**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/tasks/:id/comments` | Get task comments | All authenticated |
| POST | `/api/v1/tasks/:id/comments` | Add comment | All authenticated |
| POST | `/api/v1/tasks/:id/attachments` | Upload attachment | All authenticated |
| DELETE | `/api/v1/attachments/:id` | Delete attachment | Owner or Staff+ |

### 4.2 Request/Response Examples

**Create Task (POST /api/v1/tasks):**

```json
// Request Body
{
  "title": "Broken sprinkler - Zone B",
  "description": "The sprinkler head near the BBQ area has been broken for 3 days. Water is pooling on the pathway creating a slip hazard.",
  "category": "GARDENING",
  "location": "Back Lane - Near BBQ Area",
  "priority": "HIGH"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "task_abc123",
    "ticketNumber": "TKT-047",
    "title": "Broken sprinkler - Zone B",
    "status": "NEW",
    "priority": "HIGH",
    "category": "GARDENING",
    "reporter": {
      "id": "user_123",
      "name": "John D.",
      "unit": "Unit 8"
    },
    "createdAt": "2025-01-10T14:30:00Z"
  },
  "message": "Ticket TKT-047 created successfully"
}
```

**Update Status (PUT /api/v1/tasks/:id/status):**

```json
// Request Body
{
  "status": "IN_PROGRESS",
  "comment": "Ordered replacement part, ETA Thursday"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "id": "task_abc123",
    "status": "IN_PROGRESS",
    "updatedAt": "2025-01-11T10:00:00Z"
  },
  "message": "Status updated successfully"
}
```

**List Tasks (GET /api/v1/tasks):**

```json
// Query Parameters
// ?status=NEW,TRIAGED&priority=HIGH&assignee=staff_123&page=1&limit=20

// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": "task_abc123",
      "ticketNumber": "TKT-047",
      "title": "Broken sprinkler - Zone B",
      "category": "GARDENING",
      "priority": "HIGH",
      "status": "NEW",
      "location": "Back Lane - Near BBQ Area",
      "assignee": {
        "id": "staff_456",
        "name": "Mike S.",
        "avatar": "/images/avatars/mike.jpg"
      },
      "reporter": {
        "id": "user_123",
        "name": "John D.",
        "unit": "Unit 8"
      },
      "commentCount": 2,
      "attachmentCount": 2,
      "createdAt": "2025-01-10T14:30:00Z",
      "updatedAt": "2025-01-11T10:00:00Z"
    }
  ],
  "meta": {
    "total": 24,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

**Get Dashboard Stats (GET /api/v1/tasks/stats):**

```json
// Response (200 OK) - Staff only
{
  "success": true,
  "data": {
    "overview": {
      "totalOpen": 18,
      "totalResolved": 47,
      "totalClosed": 45,
      "overdue": 3
    },
    "byStatus": {
      "NEW": 5,
      "TRIAGED": 3,
      "IN_PROGRESS": 8,
      "PENDING": 2,
      "RESOLVED": 12,
      "CLOSED": 45
    },
    "byPriority": {
      "LOW": 8,
      "MEDIUM": 12,
      "HIGH": 5,
      "URGENT": 1
    },
    "byCategory": {
      "BUILDING_MAINTENANCE": 5,
      "GARDENING": 8,
      "SECURITY": 3,
      "CLEANLINESS": 2,
      "OTHER": 8
    },
    "recentActivity": {
      "createdToday": 3,
      "resolvedToday": 2,
      "averageResolutionTimeHours": 72
    }
  }
}
```

---

## 5. Authentication & Authorization

### 5.1 NextAuth.js Configuration

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      unit?: string;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
```

```typescript
// src/lib/auth-options.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('User not found');
        }

        // Add password verification here (bcrypt)
        // const isValid = await bcrypt.compare(credentials.password, user.password);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          unit: user.unit,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.unit = user.unit;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.unit = token.unit as string | undefined;
      }
      return session;
    },
  },
};
```

### 5.2 Permission Helper Functions

```typescript
// src/lib/permissions.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { Role } from '@prisma/client';

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  unit?: string;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as AuthUser;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  return user;
}

export async function requireStaff(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!['STAFF', 'MANAGER', 'ADMIN'].includes(user.role)) {
    throw new Error('Forbidden: Staff access required');
  }
  return user;
}

export async function requireManager(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!['MANAGER', 'ADMIN'].includes(user.role)) {
    throw new Error('Forbidden: Manager access required');
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}

// Permission check helpers
export function canViewAllTasks(role: Role): boolean {
  return ['STAFF', 'MANAGER', 'COMMITTEE', 'ADMIN'].includes(role);
}

export function canAssignTasks(role: Role): boolean {
  return ['STAFF', 'MANAGER', 'ADMIN'].includes(role);
}

export function canDeleteTasks(role: Role): boolean {
  return ['MANAGER', 'ADMIN'].includes(role);
}

export function canManageColumns(role: Role): boolean {
  return ['MANAGER', 'ADMIN'].includes(role);
}
```

### 5.3 Permission Matrix

| Action | Member | Staff | Manager | Committee | Admin |
|--------|--------|-------|---------|-----------|-------|
| View own tasks | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all tasks | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create task | ✅ | ✅ | ✅ | ❌ | ✅ |
| Update task | ❌ | ✅ (own/assigned) | ✅ | ❌ | ✅ |
| Assign tasks | ❌ | ✅ | ✅ | ❌ | ✅ |
| Change status | ❌ | ✅ | ✅ | ❌ | ✅ |
| Delete tasks | ❌ | ❌ | ✅ | ❌ | ✅ |
| View analytics | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage columns | ❌ | ❌ | ✅ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ❌ | ✅ |

---

## 6. Real-Time Updates (Optional - v2)

### 6.1 Socket.io Events

**Server Events:**

```typescript
// src/lib/socket-server.ts
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: any) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXTAUTH_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-board', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('subscribe-board', () => {
      socket.join('board:updates');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function emitTaskUpdate(event: string, data: any) {
  if (!io) return;
  io.to('board:updates').emit(event, data);
}

export function notifyUser(userId: string, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}
```

**Frontend Hook:**

```typescript
// src/hooks/useTaskSocket.ts
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;

export function useTaskSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      socket = io({
        path: '/api/socket',
        transports: ['websocket', 'polling'],
      });
    }

    socket.on('connect', () => {
      socket?.emit('subscribe-board');
    });

    socket.on('task-created', (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Show notification
    });

    socket.on('task-updated', (task) => {
      queryClient.setQueryData(['tasks', 'detail', task.id], task);
    });

    socket.on('task-moved', ({ taskId, fromStatus, toStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    return () => {
      socket?.off('task-created');
      socket?.off('task-updated');
      socket?.off('task-moved');
    };
  }, [queryClient]);

  return socket;
}
```

---

## 7. File Upload Handling

### 7.1 Upload Configuration

```typescript
// src/lib/upload-config.ts
export const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxAttachmentsPerTask: 5,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedDocumentTypes: ['application/pdf'],
  storageFolder: 'cgrs-tasks',
};

// Validate file before upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > uploadConfig.maxFileSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }
  
  const isValidType = [
    ...uploadConfig.allowedImageTypes,
    ...uploadConfig.allowedDocumentTypes,
  ].includes(file.type);
  
  if (!isValidType) {
    return { valid: false, error: 'File type not supported' };
  }
  
  return { valid: true };
}
```

### 7.2 Upload API Route

```typescript
// src/app/api/v1/tasks/[id]/attachments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { uploadConfig, validateFile } from '@/lib/upload-config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    const taskId = params.id;

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check attachment count
    const currentCount = await prisma.attachment.count({
      where: { taskId },
    });

    if (currentCount >= uploadConfig.maxAttachmentsPerTask) {
      return NextResponse.json(
        { success: false, error: 'Maximum attachments reached' },
        { status: 400 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Convert to buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `${uploadConfig.storageFolder}/${taskId}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Save attachment record
    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        filename: file.name,
        url: uploadResult.secure_url,
        thumbnail: uploadResult.resource_type === 'image' 
          ? uploadResult.secure_url 
          : null,
        type: uploadResult.resource_type,
        size: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

---

## 8. Input Validation (Zod Schemas)

```typescript
// src/lib/validators.ts
import { z } from 'zod';

// Task creation
export const createTaskSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(5000),
  category: z.enum([
    'BUILDING_MAINTENANCE',
    'GARDENING',
    'SECURITY',
    'CLEANLINESS',
    'NOISE',
    'ACCESSIBILITY',
    'PARKING',
    'FACILITIES',
    'EMERGENCY',
    'GENERAL',
  ]),
  location: z.string().min(3).max(200),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

// Task update (partial)
export const updateTaskSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(10).max(5000).optional(),
  category: z.enum([
    'BUILDING_MAINTENANCE',
    'GARDENING',
    // ... all categories
  ]).optional(),
  location: z.string().min(3).max(200).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

// Status update
export const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'TRIAGED', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED']),
  comment: z.string().max(1000).optional(),
});

// Comment creation
export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

// Filter validation
export const taskFilterSchema = z.object({
  status: z.array(z.string()).optional(),
  priority: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
  assigneeId: z.string().optional(),
  searchQuery: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Type exports
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type TaskFilter = z.infer<typeof taskFilterSchema>;
```

---

## 9. Performance & Scalability

### 9.1 Database Indexes

```sql
-- Critical indexes for query performance
CREATE INDEX idx_tasks_status ON "Task"(status);
CREATE INDEX idx_tasks_priority ON "Task"(priority);
CREATE INDEX idx_tasks_assignee ON "Task"(assigneeId);
CREATE INDEX idx_tasks_reporter ON "Task"(reporterId);
CREATE INDEX idx_tasks_created_at ON "Task"(createdAt DESC);
CREATE INDEX idx_tasks_status_assignee ON "Task"(status, assigneeId);
CREATE INDEX idx_tasks_status_priority ON "Task"(status, priority);
CREATE INDEX idx_activity_task ON "ActivityLog"(taskId);
CREATE INDEX idx_activity_user ON "ActivityLog"(userId);
CREATE INDEX idx_comments_task ON "Comment"(taskId);
CREATE INDEX idx_attachments_task ON "Attachment"(taskId);
```

### 9.2 Caching Strategy

| Data | Cache Strategy | TTL |
|------|----------------|-----|
| Task list (filtered) | TanStack Query | 5 minutes |
| Task detail | TanStack Query | 2 minutes |
| Dashboard stats | TanStack Query | 1 minute |
| User session | NextAuth | Session |
| Static data | Static (import) | N/A |

### 9.3 Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create rate limiters (if using Upstash Redis)
export const tasksRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '60 m'),
  analytics: true,
  prefix: 'cgrs-tasks',
});

export const uploadRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'cgrs-uploads',
});

// Simple in-memory rate limiting (for simpler deployment)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string, 
  maxRequests: number = 60, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}
```

---

## 10. Security Considerations

### 10.1 Security Headers

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 10.2 Input Sanitization

```typescript
// src/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// Sanitize HTML content (if allowing rich text)
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

// Validate and sanitize search queries
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[<>]/g, '') // Remove potential HTML
    .trim()
    .slice(0, 100); // Limit length
}
```

---

## 11. Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cgrs_tasks"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="https://cgrs.co.nz"

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Optional: Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Optional: Socket.io
SOCKET_SERVER_URL="https://cgrs.co.nz"
```

---

## 12. Deployment

### 12.1 Vercel Deployment (Recommended)

```json
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" }
      ]
    }
  ]
}
```

### 12.2 Build Command

```bash
# Install dependencies
npm ci

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Start production server
npm start
```

---

## 13. API Versioning Strategy

| Version | Status | Path | Notes |
|---------|--------|------|-------|
| v1 | Current | `/api/v1/*` | Initial release |
| v2 | Planned | `/api/v2/*` | Real-time features, bulk operations |

Breaking changes will trigger a new version. Non-breaking additions can be added to the current version.

---

**Document Version:** 1.1 (Refined)  
**Last Updated:** January 14, 2025  
**Next Steps:** Implementation Planning & Sprint Breakdown
