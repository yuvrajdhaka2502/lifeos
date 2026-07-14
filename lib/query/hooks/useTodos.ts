'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types'
import { qk } from '../keys'

export type Urgency = Database['public']['Enums']['urgency_level']
export type Todo = {
  id: string
  title: string
  urgency: Urgency
  due_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
}

const COLS = 'id, title, urgency, due_date, completed, completed_at, created_at'

/** F3 — the general to-do list (independent of all track data). */
export function useTodos() {
  const supabase = createClient()
  return useQuery({
    queryKey: qk.todos,
    queryFn: async (): Promise<Todo[]> => {
      const { data, error } = await supabase.from('todos').select(COLS).order('created_at')
      if (error) throw error
      return data
    },
  })
}

/** Shared optimistic-list plumbing: apply `fn` to the cached list, roll back on error. */
function useTodoListMutation<V>(mutationFn: (v: V) => Promise<void>, apply: (list: Todo[], v: V) => Todo[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onMutate: async (v: V) => {
      await qc.cancelQueries({ queryKey: qk.todos })
      const prev = qc.getQueryData<Todo[]>(qk.todos)
      qc.setQueryData<Todo[]>(qk.todos, (list) => apply(list ?? [], v))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.todos, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.todos }),
  })
}

/** Create with title + urgency (+ optional due date) in one action (PRD F3). */
export function useAddTodo() {
  const supabase = createClient()
  return useTodoListMutation(
    async (v: { title: string; urgency: Urgency; due_date: string | null }) => {
      const { error } = await supabase.from('todos').insert(v)
      if (error) throw error
    },
    (list, v) => [
      ...list,
      {
        id: `tmp-${Date.now()}`,
        completed: false,
        completed_at: null,
        created_at: new Date().toISOString(),
        ...v,
      },
    ],
  )
}

export function useToggleTodo() {
  const supabase = createClient()
  return useTodoListMutation(
    async (v: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('todos')
        .update({ completed: v.completed, completed_at: v.completed ? new Date().toISOString() : null })
        .eq('id', v.id)
      if (error) throw error
    },
    (list, v) => list.map((t) => (t.id === v.id ? { ...t, completed: v.completed } : t)),
  )
}

export function useUpdateTodo() {
  const supabase = createClient()
  return useTodoListMutation(
    async (v: { id: string; title: string; urgency: Urgency; due_date: string | null }) => {
      const { error } = await supabase
        .from('todos')
        .update({ title: v.title, urgency: v.urgency, due_date: v.due_date })
        .eq('id', v.id)
      if (error) throw error
    },
    (list, v) => list.map((t) => (t.id === v.id ? { ...t, ...v } : t)),
  )
}

export function useDeleteTodo() {
  const supabase = createClient()
  return useTodoListMutation(
    async (v: { id: string }) => {
      const { error } = await supabase.from('todos').delete().eq('id', v.id)
      if (error) throw error
    },
    (list, v) => list.filter((t) => t.id !== v.id),
  )
}
