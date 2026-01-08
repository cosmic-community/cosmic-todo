import { createBucketClient } from '@cosmicjs/sdk'
import { Task, List, User, CosmicObject } from '@/types'

// Initialize Cosmic client for read operations
const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG || '',
  readKey: process.env.COSMIC_READ_KEY || '',
  writeKey: process.env.COSMIC_WRITE_KEY || '',
})

// Type guard for error checking
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error
}

// Get all tasks
export async function getTasks(): Promise<Task[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'tasks' })
      .props(['id', 'slug', 'title', 'metadata', 'type', 'created_at', 'modified_at'])
      .depth(1)
    
    return (response.objects || []) as Task[]
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw error
  }
}

// Get tasks for a specific user
export async function getTasksForUser(userId: string): Promise<Task[]> {
  try {
    const response = await cosmic.objects
      .find({ 
        type: 'tasks',
        'metadata.owner': userId
      })
      .props(['id', 'slug', 'title', 'metadata', 'type', 'created_at', 'modified_at'])
      .depth(1)
    
    return (response.objects || []) as Task[]
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw error
  }
}

// Get a single task by ID
export async function getTaskById(id: string): Promise<Task | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'tasks',
      id: id
    }).depth(1)
    
    return response.object as Task
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw error
  }
}

// Create a new task
export async function createTask(data: {
  title: string
  description?: string
  priority?: string
  due_date?: string
  list?: string
  owner?: string
}): Promise<Task> {
  const response = await cosmic.objects.insertOne({
    title: data.title,
    type: 'tasks',
    metadata: {
      title: data.title,
      description: data.description || '',
      completed: false,
      starred: false,
      priority: data.priority || '',
      due_date: data.due_date || '',
      list: data.list || '',
      owner: data.owner || ''
    }
  })
  
  return response.object as Task
}

// Update a task
export async function updateTask(id: string, data: {
  title?: string
  description?: string
  completed?: boolean
  starred?: boolean
  priority?: string
  due_date?: string
  list?: string
}): Promise<Task> {
  const metadata: Record<string, unknown> = {}
  
  if (data.title !== undefined) metadata.title = data.title
  if (data.description !== undefined) metadata.description = data.description
  if (data.completed !== undefined) metadata.completed = data.completed
  if (data.starred !== undefined) metadata.starred = data.starred
  if (data.priority !== undefined) metadata.priority = data.priority
  if (data.due_date !== undefined) metadata.due_date = data.due_date
  if (data.list !== undefined) metadata.list = data.list
  
  const updateData: { title?: string; metadata: Record<string, unknown> } = { metadata }
  if (data.title !== undefined) updateData.title = data.title
  
  const response = await cosmic.objects.updateOne(id, updateData)
  
  return response.object as Task
}

// Delete a task
export async function deleteTask(id: string): Promise<void> {
  await cosmic.objects.deleteOne(id)
}

// Get all lists
export async function getLists(): Promise<List[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'lists' })
      .props(['id', 'slug', 'title', 'metadata', 'type', 'created_at', 'modified_at'])
      .depth(1)
    
    return (response.objects || []) as List[]
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw error
  }
}

// Get lists for a specific user (owned or shared)
export async function getListsForUser(userId: string): Promise<List[]> {
  try {
    // First get lists owned by user
    const ownedResponse = await cosmic.objects
      .find({ 
        type: 'lists',
        'metadata.owner': userId
      })
      .props(['id', 'slug', 'title', 'metadata', 'type', 'created_at', 'modified_at'])
      .depth(1)
    
    const ownedLists = (ownedResponse.objects || []) as List[]
    
    // For shared lists, we'd need additional logic
    // For now, return owned lists
    return ownedLists
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return []
    }
    throw error
  }
}

// Get a single list by slug
export async function getListBySlug(slug: string): Promise<List | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'lists',
      slug: slug
    }).depth(1)
    
    return response.object as List
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw error
  }
}

// Get a single list by ID
export async function getListById(id: string): Promise<List | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'lists',
      id: id
    }).depth(1)
    
    return response.object as List
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw error
  }
}

// Create a new list
export async function createList(data: {
  name: string
  description?: string
  color?: string
  owner?: string
}): Promise<List> {
  const response = await cosmic.objects.insertOne({
    title: data.name,
    type: 'lists',
    metadata: {
      name: data.name,
      description: data.description || '',
      color: data.color || '#3b82f6',
      owner: data.owner || '',
      shared_with: [],
      share_token: ''
    }
  })
  
  return response.object as List
}

// Update a list
export async function updateList(id: string, data: {
  name?: string
  description?: string
  color?: string
  share_token?: string
  shared_with?: string[]
}): Promise<List> {
  const metadata: Record<string, unknown> = {}
  
  if (data.name !== undefined) metadata.name = data.name
  if (data.description !== undefined) metadata.description = data.description
  if (data.color !== undefined) metadata.color = data.color
  if (data.share_token !== undefined) metadata.share_token = data.share_token
  if (data.shared_with !== undefined) metadata.shared_with = data.shared_with
  
  const updateData: { title?: string; metadata: Record<string, unknown> } = { metadata }
  if (data.name !== undefined) updateData.title = data.name
  
  const response = await cosmic.objects.updateOne(id, updateData)
  
  return response.object as List
}

// Delete a list
export async function deleteList(id: string): Promise<void> {
  await cosmic.objects.deleteOne(id)
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'users',
      'metadata.email': email.toLowerCase()
    }).depth(1)
    
    return response.object as User
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw error
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'users',
      id: id
    }).depth(1)
    
    return response.object as User
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw error
  }
}

// Get user by password reset token
export async function getUserByResetToken(token: string): Promise<User | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'users',
      'metadata.password_reset_token': token
    }).depth(1)
    
    return response.object as User
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw error
  }
}

// Create a new user
export async function createUser(data: {
  email: string
  password_hash: string
  display_name: string
  verification_code?: string
}): Promise<User> {
  const slug = `${data.email.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}`
  
  const response = await cosmic.objects.insertOne({
    title: data.display_name,
    slug: slug,
    type: 'users',
    metadata: {
      email: data.email.toLowerCase(),
      password_hash: data.password_hash,
      display_name: data.display_name,
      email_verified: false,
      verification_code: data.verification_code || '',
      password_reset_token: '',
      password_reset_expires: '',
      checkbox_position: 'left'
    }
  })
  
  return response.object as User
}

// Update a user
export async function updateUser(id: string, data: {
  display_name?: string
  email_verified?: boolean
  verification_code?: string
  password_hash?: string
  password_reset_token?: string
  password_reset_expires?: string
  checkbox_position?: string
}): Promise<User> {
  const metadata: Record<string, unknown> = {}
  
  if (data.display_name !== undefined) metadata.display_name = data.display_name
  if (data.email_verified !== undefined) metadata.email_verified = data.email_verified
  if (data.verification_code !== undefined) metadata.verification_code = data.verification_code
  if (data.password_hash !== undefined) metadata.password_hash = data.password_hash
  if (data.password_reset_token !== undefined) metadata.password_reset_token = data.password_reset_token
  if (data.password_reset_expires !== undefined) metadata.password_reset_expires = data.password_reset_expires
  if (data.checkbox_position !== undefined) metadata.checkbox_position = data.checkbox_position
  
  const updateData: { title?: string; metadata: Record<string, unknown> } = { metadata }
  if (data.display_name !== undefined) updateData.title = data.display_name
  
  const response = await cosmic.objects.updateOne(id, updateData)
  
  return response.object as User
}

// Get list by share token
export async function getListByShareToken(token: string): Promise<List | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'lists',
      'metadata.share_token': token
    }).depth(1)
    
    return response.object as List
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw error
  }
}

export { cosmic }