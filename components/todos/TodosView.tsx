'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { istDateKey } from '@/lib/date'
import {
  useAddTodo,
  useDeleteTodo,
  useTodos,
  useToggleTodo,
  useUpdateTodo,
  type Todo,
  type Urgency,
} from '@/lib/query/hooks/useTodos'

/** Urgency order + left-border colors (doc 04 §5.7) — urgent surfaces first. */
const URGENCIES: { value: Urgency; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: '#EF4444' },
  { value: 'high', label: 'High', color: '#FB923C' },
  { value: 'medium', label: 'Medium', color: '#EAB308' },
  { value: 'low', label: 'Low', color: '#64748B' },
]
const urgencyMeta = (u: Urgency) => URGENCIES.find((x) => x.value === u)!

const byDueThenCreated = (a: Todo, b: Todo) =>
  (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999') || a.created_at.localeCompare(b.created_at)

/** F3 — general to-do list: urgency groups, quick-add pinned at the bottom,
 *  completed items collapsed under a "Done" divider. All writes optimistic. */
export function TodosView() {
  const { data: todos = [] } = useTodos()
  const open = todos.filter((t) => !t.completed)
  const done = todos.filter((t) => t.completed)
  const [showDone, setShowDone] = useState(false)

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col">
      <div className="mb-5 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold tracking-tight">To-Do</h1>
        <span className="font-mono text-xs tabular-nums text-muted">
          {open.length} open · {open.filter((t) => t.urgency === 'urgent').length} urgent
        </span>
      </div>

      <div className="flex-1 space-y-5">
        {open.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted">
            All clear — add a task below.
          </p>
        )}
        {URGENCIES.map(({ value, label, color }) => {
          const group = open.filter((t) => t.urgency === value).sort(byDueThenCreated)
          if (group.length === 0) return null
          return (
            <section key={value}>
              <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                {label} · {group.length}
              </h2>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {group.map((t) => (
                    <TodoRow key={t.id} todo={t} color={color} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )
        })}

        {done.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => setShowDone((s) => !s)}
              className="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted transition hover:text-foreground"
            >
              Done · {done.length}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDone ? 'rotate-180' : ''}`} />
            </button>
            {showDone && (
              <div className="space-y-2 opacity-60">
                {done
                  .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''))
                  .map((t) => (
                    <TodoRow key={t.id} todo={t} color={urgencyMeta(t.urgency).color} />
                  ))}
              </div>
            )}
          </section>
        )}
      </div>

      <QuickAdd />
    </div>
  )
}

function TodoRow({ todo, color }: { todo: Todo; color: string }) {
  const toggle = useToggleTodo()
  const remove = useDeleteTodo()
  const update = useUpdateTodo()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [urgency, setUrgency] = useState<Urgency>(todo.urgency)
  const [due, setDue] = useState(todo.due_date ?? '')
  const overdue = !todo.completed && todo.due_date != null && todo.due_date < istDateKey()

  const save = () => {
    if (!title.trim()) return
    update.mutate({ id: todo.id, title: title.trim(), urgency, due_date: due || null })
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card py-2.5 pr-2 pl-3"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <button
        type="button"
        onClick={() => toggle.mutate({ id: todo.id, completed: !todo.completed })}
        aria-label={todo.completed ? 'mark open' : 'mark done'}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
          todo.completed ? 'border-accent bg-accent/90' : 'border-border hover:border-accent'
        }`}
      >
        {todo.completed && <Check className="h-3 w-3" stroke="#0a0a0f" strokeWidth={3} />}
      </button>

      {editing ? (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-accent"
          />
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as Urgency)}
            className="rounded-lg border border-border bg-background px-1.5 py-1 text-xs outline-none focus:border-accent"
          >
            {URGENCIES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="rounded-lg border border-border bg-background px-1.5 py-1 font-mono text-xs outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={save}
            aria-label="save"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-background"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <>
          <span
            className={`min-w-0 flex-1 truncate text-sm ${
              todo.completed ? 'text-muted line-through decoration-border' : ''
            }`}
          >
            {todo.title}
          </span>
          {todo.due_date && (
            <span
              className={`shrink-0 rounded-full border px-1.5 py-px font-mono text-[10px] tabular-nums ${
                overdue ? 'border-red-500/60 text-red-400' : 'border-border text-muted'
              }`}
            >
              {todo.due_date.slice(5)}
            </span>
          )}
          {!todo.completed && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="edit"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted opacity-0 transition group-hover:opacity-100 hover:text-foreground focus:opacity-100"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => remove.mutate({ id: todo.id })}
            aria-label="delete"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted opacity-0 transition group-hover:opacity-100 hover:text-red-400 focus:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </motion.div>
  )
}

/** Quick-add bar pinned at the bottom (doc 04 §5.7): title + urgency (+ due) in one action. */
function QuickAdd() {
  const add = useAddTodo()
  const [title, setTitle] = useState('')
  const [urgency, setUrgency] = useState<Urgency>('medium')
  const [due, setDue] = useState('')

  const submit = () => {
    if (!title.trim()) return
    add.mutate({ title: title.trim(), urgency, due_date: due || null })
    setTitle('')
    setDue('')
  }

  return (
    <div className="sticky bottom-4 mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/90 p-2 shadow-lg backdrop-blur">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Add a task…"
        className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent"
      />
      <select
        value={urgency}
        onChange={(e) => setUrgency(e.target.value as Urgency)}
        aria-label="urgency"
        className="rounded-xl border border-border bg-background px-2 py-2 text-xs outline-none focus:border-accent"
      >
        {URGENCIES.map((u) => (
          <option key={u.value} value={u.value}>
            {u.label}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={due}
        onChange={(e) => setDue(e.target.value)}
        aria-label="due date"
        className="rounded-xl border border-border bg-background px-2 py-2 font-mono text-xs outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={submit}
        aria-label="add task"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-background transition hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
