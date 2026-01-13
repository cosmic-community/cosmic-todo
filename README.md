# 📝 Cosmic Todo

![App Preview](https://imgix.cosmicjs.com/839fb980-ec05-11f0-8092-4592c74830bf-cosmic-todo.jpeg?w=1200&h=400&fit=crop&auto=format,compress)

A beautiful, modern todo list application inspired by Wunderlist, built with Next.js 16 and powered by Cosmic CMS. Organize your tasks into custom lists, collaborate with others, and enjoy delightful animations as you complete your tasks.

## ✨ Features

### Task Management
- ✅ **Create, Edit & Complete Tasks** - Full task CRUD with intuitive click-to-edit interface
- 🎯 **Priority Levels** - Assign Low, Medium, or High priority with visual flag indicators
- 📅 **Due Dates** - Track deadlines and stay on schedule
- 📝 **Task Descriptions** - Add detailed notes to any task
- 🔄 **Drag & Drop Reordering** - Easily reorganize tasks with smooth drag and drop
- ⚡ **Optimistic Updates** - Instant UI feedback with background sync

### Lists & Organization
- 📋 **Custom Lists** - Create unlimited color-coded lists
- 🎨 **Color Picker** - Choose from a wide palette of colors for visual organization
- 📬 **All Tasks View** - See all tasks across all lists in one place

### Collaboration
- 👥 **Share Lists** - Invite others to collaborate on lists via email
- ✉️ **Email Invitations** - Send personalized invitation messages
- 🔐 **Owner Permissions** - List owners control edit and invite access

### User Accounts
- 🔑 **Secure Authentication** - Full signup/login system with JWT tokens
- ✉️ **Email Verification** - Verify accounts via email
- 🔄 **Password Reset** - Secure password recovery via email link
- 👤 **User Profiles** - Customize display name in settings

### Personalization
- 🌓 **Dark/Light/System Mode** - Choose your preferred color theme
- 🎨 **8 Style Themes** - Default, Ocean, Forest, Sunset, Rose, Lavender, Peach, and Mint
- ↔️ **Checkbox Position** - Place checkboxes on the left or right side
- 💾 **Synced Preferences** - Settings persist across devices when logged in

### Celebrations & Animations
- 🎉 **Task Completion Confetti** - Satisfying confetti burst when completing tasks
- 🎆 **All Done Fireworks** - Epic fireworks display when you complete all tasks in a list
- ✨ **Smooth Transitions** - Polished animations throughout the app

### Progressive Web App
- 📱 **Installable PWA** - Add to home screen on mobile devices
- 🖥️ **Desktop App** - Install as a desktop application
- 📴 **Offline-Ready** - Service worker for improved performance

### Design
- 🎨 **Beautiful UI** - Clean, modern design with attention to detail
- 📱 **Mobile Optimized** - Fully responsive with touch-friendly controls
- 🔔 **Toast Notifications** - Elegant feedback for all actions

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=695dc02cf4835a7e91ecee1d&clone_repository=695dc18ff4835a7e91ecee87)

## 🛠️ Technologies

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **CMS**: Cosmic
- **Language**: TypeScript
- **Authentication**: JWT (jose)
- **Email**: Resend
- **Drag & Drop**: @dnd-kit
- **Notifications**: react-hot-toast
- **Icons**: Lucide React
- **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Cosmic account and bucket
- A Resend account (for email features)

### Installation

1. Clone this repository
2. Install dependencies:
```bash
bun install
```

3. Create a `.env.local` file in the root directory:
```env
# Cosmic CMS
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key

# Authentication
JWT_SECRET=your-secret-key-min-32-characters

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: for the "Built with Cosmic" badge
NEXT_PUBLIC_COSMIC_BUCKET_SLUG=your-bucket-slug
```

4. Run the development server:
```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Cosmic SDK Examples

### Fetching Tasks with Related Lists

```typescript
import { cosmic } from '@/lib/cosmic'

// Get all tasks with their associated lists
const { objects: tasks } = await cosmic.objects
  .find({ type: 'tasks' })
  .props(['id', 'title', 'slug', 'metadata'])
  .depth(1) // Include related list data

// Filter tasks by completion status
const completedTasks = tasks.filter(task => task.metadata.completed)
const pendingTasks = tasks.filter(task => !task.metadata.completed)
```

### Creating a New Task

```typescript
// Create a task with all metadata fields
await cosmic.objects.insertOne({
  type: 'tasks',
  title: 'New Task',
  metadata: {
    title: 'New Task',
    description: 'Task description here',
    completed: false,
    priority: { key: 'medium', value: 'Medium' },
    due_date: '2024-12-31',
    list: 'list-object-id', // ID of the associated list
    owner: 'user-object-id' // ID of the task owner
  }
})
```

### Updating Task Status

```typescript
// Toggle task completion - only include changed fields
await cosmic.objects.updateOne(taskId, {
  metadata: {
    completed: true
  }
})
```

### Fetching Lists

```typescript
// Get all lists with their metadata
const { objects: lists } = await cosmic.objects
  .find({ type: 'lists' })
  .props(['id', 'title', 'slug', 'metadata'])
```

## 🎨 Cosmic CMS Integration

This application uses three main content types:

### Tasks Object Type
- **Title** (text, required) - Task name
- **Description** (textarea) - Detailed task description
- **Completed** (switch) - Task completion status
- **Priority** (select-dropdown) - Low, Medium, or High
- **Due Date** (date) - Task deadline
- **List** (object relation) - Associated list
- **Owner** (object relation) - Task owner (user)
- **Order** (number) - Position for drag & drop ordering

### Lists Object Type
- **Name** (text, required) - List name
- **Description** (textarea) - List description
- **Color** (color) - Custom list color for visual organization
- **Owner** (object relation) - List owner (user)
- **Shared With** (object relation, multiple) - Users the list is shared with
- **Share Token** (text) - Token for invitation links

### Users Object Type
- **Email** (text, required) - User email address
- **Password Hash** (text) - Bcrypt hashed password
- **Display Name** (text) - User's display name
- **Email Verified** (switch) - Email verification status
- **Verification Code** (text) - Email verification code
- **Password Reset Token** (text) - Token for password reset
- **Password Reset Expires** (text) - Expiration time for reset token
- **Checkbox Position** (select-dropdown) - Left or Right preference
- **Color Theme** (select-dropdown) - Light, Dark, or System
- **Style Theme** (select-dropdown) - Default, Ocean, Forest, Sunset, Rose, Lavender, Peach, Mint

All content is managed through your Cosmic dashboard and automatically syncs with the application.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `COSMIC_BUCKET_SLUG`
   - `COSMIC_READ_KEY`
   - `COSMIC_WRITE_KEY`
   - `JWT_SECRET`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Create a new site in Netlify
3. Configure build settings:
   - Build command: `bun run build`
   - Publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy!

For production deployments, ensure all environment variables are properly configured in your hosting platform's dashboard.

## 📄 License

MIT License - feel free to use this project as a starting point for your own applications.

<!-- README_END -->
