export interface Task {
  id: string
  title: string
  slug: string
  type: string
  created_at?: string
  modified_at?: string
  metadata: {
    title: string
    description?: string
    completed: boolean
    priority?: {
      key: string
      value: string
    }
    due_date?: string
    list?: List | string
    owner?: User | string
    starred?: boolean
  }
}

export interface List {
  id: string
  title: string
  slug: string
  type: string
  created_at?: string
  modified_at?: string
  metadata: {
    name: string
    description?: string
    color?: string
    owner?: User | string
    created_by?: User | string
    shared_with?: (User | string)[]
    share_token?: string
  }
}

export interface User {
  id: string
  title: string
  slug: string
  type: string
  metadata: {
    email: string
    password_hash: string
    display_name: string
    email_verified?: boolean
    verification_code?: string
    password_reset_token?: string
    password_reset_expires?: string
    checkbox_position?: CheckboxPosition
    color_theme?: ColorTheme
    style_theme?: StyleTheme
  }
}

export interface AuthUser {
  id: string
  email: string
  display_name: string
  email_verified: boolean
  checkbox_position?: CheckboxPosition
  color_theme?: ColorTheme
  style_theme?: StyleTheme
}

export type CheckboxPosition = 'left' | 'right'
export type ColorTheme = 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink'
export type StyleTheme = 'default' | 'minimal' | 'compact'