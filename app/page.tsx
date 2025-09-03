"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Tag,
  X,
  Filter,
  Palette,
  Bell,
  BellRing,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Indent,
} from "lucide-react"

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
  tags: string[]
  color: string
  reminderDate?: Date
  parentId?: string
  level: number
  isExpanded?: boolean
}

const TASK_COLORS = [
  {
    name: "Default",
    value: "default",
    bg: "bg-white dark:bg-purple-950",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-900 dark:text-purple-100",
  },
  {
    name: "Red",
    value: "red",
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-900 dark:text-red-100",
  },
  {
    name: "Orange",
    value: "orange",
    bg: "bg-orange-50 dark:bg-orange-950",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-900 dark:text-orange-100",
  },
  {
    name: "Yellow",
    value: "yellow",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-900 dark:text-yellow-100",
  },
  {
    name: "Green",
    value: "green",
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-900 dark:text-green-100",
  },
  {
    name: "Blue",
    value: "blue",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-900 dark:text-blue-100",
  },
  {
    name: "Indigo",
    value: "indigo",
    bg: "bg-indigo-50 dark:bg-indigo-950",
    border: "border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-900 dark:text-indigo-100",
  },
  {
    name: "Pink",
    value: "pink",
    bg: "bg-pink-50 dark:bg-pink-950",
    border: "border-pink-200 dark:border-pink-800",
    text: "text-pink-900 dark:text-pink-100",
  },
]

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskTags, setNewTaskTags] = useState("")
  const [newTaskColor, setNewTaskColor] = useState("default")
  const [newTaskReminder, setNewTaskReminder] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedReminderFilter, setSelectedReminderFilter] = useState<string>("")
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null)

  const getReminderStatus = (reminderDate?: Date) => {
    if (!reminderDate) return null

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const reminderDay = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate())

    if (reminderDay < today) return "overdue"
    if (reminderDay.getTime() === today.getTime()) return "today"
    if (reminderDay <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) return "upcoming"
    return "future"
  }

  const addTask = (parentId?: string) => {
    if (newTaskTitle.trim()) {
      const tags = newTaskTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => tag.toLowerCase())

      const parentTask = parentId ? tasks.find((t) => t.id === parentId) : null
      const level = parentTask ? parentTask.level + 1 : 0

      const newTask: Task = {
        id: crypto.randomUUID(),
        title: newTaskTitle.trim(),
        completed: false,
        createdAt: new Date(),
        tags,
        color: newTaskColor,
        reminderDate: newTaskReminder ? new Date(newTaskReminder) : undefined,
        parentId,
        level,
        isExpanded: true,
      }

      // Insert subtask right after its parent
      if (parentId) {
        const parentIndex = tasks.findIndex((t) => t.id === parentId)
        const newTasks = [...tasks]
        newTasks.splice(parentIndex + 1, 0, newTask)
        setTasks(newTasks)

        // Expand parent task
        setTasks((prev) => prev.map((t) => (t.id === parentId ? { ...t, isExpanded: true } : t)))
      } else {
        setTasks([newTask, ...tasks])
      }

      setNewTaskTitle("")
      setNewTaskTags("")
      setNewTaskColor("default")
      setNewTaskReminder("")
      setAddingSubtaskFor(null)
    }
  }

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id)
    if (!taskToDelete) return

    // Get all descendant tasks
    const getDescendants = (parentId: string): string[] => {
      const children = tasks.filter((t) => t.parentId === parentId)
      const descendants = children.map((c) => c.id)
      children.forEach((child) => {
        descendants.push(...getDescendants(child.id))
      })
      return descendants
    }

    const toDelete = [id, ...getDescendants(id)]
    setTasks(tasks.filter((task) => !toDelete.includes(task.id)))
  }

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const newCompleted = !task.completed
    const now = new Date()

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            completed: newCompleted,
            completedAt: newCompleted ? now : undefined,
          }
        }
        return t
      }),
    )

    // Auto-complete/uncomplete subtasks
    const getDescendants = (parentId: string): string[] => {
      const children = tasks.filter((t) => t.parentId === parentId)
      const descendants = children.map((c) => c.id)
      children.forEach((child) => {
        descendants.push(...getDescendants(child.id))
      })
      return descendants
    }

    const descendants = getDescendants(id)
    if (descendants.length > 0) {
      setTasks((prev) =>
        prev.map((t) =>
          descendants.includes(t.id)
            ? { ...t, completed: newCompleted, completedAt: newCompleted ? now : undefined }
            : t,
        ),
      )
    }

    // Check if parent should be auto-completed
    if (task.parentId && newCompleted) {
      const siblings = tasks.filter((t) => t.parentId === task.parentId && t.id !== id)
      const allSiblingsCompleted = siblings.every((s) => s.completed)

      if (allSiblingsCompleted) {
        setTasks((prev) => prev.map((t) => (t.id === task.parentId ? { ...t, completed: true, completedAt: now } : t)))
      }
    }
  }

  const toggleExpansion = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isExpanded: !t.isExpanded } : t)))
  }

  const getVisibleTasks = (allTasks: Task[]): Task[] => {
    const visible: Task[] = []

    const addTaskAndChildren = (task: Task, shouldShow = true) => {
      if (shouldShow) {
        visible.push(task)
      }

      const children = allTasks.filter((t) => t.parentId === task.id)
      children.forEach((child) => {
        addTaskAndChildren(child, shouldShow && task.isExpanded !== false)
      })
    }

    // Add root tasks first
    const rootTasks = allTasks.filter((t) => !t.parentId)
    rootTasks.forEach((task) => addTaskAndChildren(task))

    return visible
  }

  const getSubtaskCount = (parentId: string): { total: number; completed: number } => {
    const subtasks = tasks.filter((t) => t.parentId === parentId)
    return {
      total: subtasks.length,
      completed: subtasks.filter((t) => t.completed).length,
    }
  }

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleColorFilter = (color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]))
  }

  const clearTagFilters = () => {
    setSelectedTags([])
  }

  const clearColorFilters = () => {
    setSelectedColors([])
  }

  const clearAllFilters = () => {
    setSelectedTags([])
    setSelectedColors([])
    setSelectedReminderFilter("")
  }

  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags))).sort()
  const usedColors = Array.from(new Set(tasks.map((task) => task.color)))

  const filteredTasks = tasks.filter((task) => {
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => task.tags.includes(tag))
    const matchesColors = selectedColors.length === 0 || selectedColors.includes(task.color)

    let matchesReminder = true
    if (selectedReminderFilter) {
      const status = getReminderStatus(task.reminderDate)
      if (selectedReminderFilter === "with-reminders") {
        matchesReminder = !!task.reminderDate
      } else if (selectedReminderFilter === "no-reminders") {
        matchesReminder = !task.reminderDate
      } else {
        matchesReminder = status === selectedReminderFilter
      }
    }

    return matchesTags && matchesColors && matchesReminder
  })

  const visibleTasks = getVisibleTasks(filteredTasks)

  const reminderStats = {
    overdue: tasks.filter((task) => !task.completed && getReminderStatus(task.reminderDate) === "overdue").length,
    today: tasks.filter((task) => !task.completed && getReminderStatus(task.reminderDate) === "today").length,
    upcoming: tasks.filter((task) => !task.completed && getReminderStatus(task.reminderDate) === "upcoming").length,
  }

  const getTaskColorStyles = (color: string, completed: boolean) => {
    if (completed) {
      return {
        bg: "bg-green-50 dark:bg-green-950",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-700 dark:text-green-300",
      }
    }

    const colorConfig = TASK_COLORS.find((c) => c.value === color) || TASK_COLORS[0]
    return colorConfig
  }

  const getReminderBadge = (reminderDate?: Date) => {
    const status = getReminderStatus(reminderDate)
    if (!status) return null

    const badges = {
      overdue: {
        text: "Overdue",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: AlertTriangle,
      },
      today: {
        text: "Due Today",
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        icon: BellRing,
      },
      upcoming: {
        text: "Upcoming",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        icon: Clock,
      },
      future: {
        text: "Scheduled",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        icon: Bell,
      },
    }

    const badge = badges[status]
    const IconComponent = badge.icon

    return (
      <Badge variant="secondary" className={badge.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {badge.text}
      </Badge>
    )
  }

  const completedCount = visibleTasks.filter((task) => task.completed).length
  const totalCount = visibleTasks.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 dark:text-purple-100 mb-2">Todo Master</h1>
          <p className="text-purple-700 dark:text-purple-300">Organize your tasks with style</p>
        </div>

        {(reminderStats.overdue > 0 || reminderStats.today > 0) && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
                <BellRing className="w-5 h-5" />
                <span className="font-medium">Reminder Alerts</span>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                {reminderStats.overdue > 0 && (
                  <div className="text-red-700 dark:text-red-300">
                    {reminderStats.overdue} task{reminderStats.overdue > 1 ? "s" : ""} overdue
                  </div>
                )}
                {reminderStats.today > 0 && (
                  <div className="text-red-700 dark:text-red-300">
                    {reminderStats.today} task{reminderStats.today > 1 ? "s" : ""} due today
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-800 dark:text-purple-200">
              {addingSubtaskFor ? "Add Subtask" : "Add New Task"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {addingSubtaskFor && (
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900 p-2 rounded">
                  <Indent className="w-4 h-4" />
                  Adding subtask to: {tasks.find((t) => t.id === addingSubtaskFor)?.title}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddingSubtaskFor(null)}
                    className="ml-auto h-auto p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && addTask(addingSubtaskFor || undefined)}
                  className="flex-1"
                />
                <Button
                  onClick={() => addTask(addingSubtaskFor || undefined)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="flex gap-2 items-center">
                <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <Input
                  placeholder="Add tags (comma separated, e.g., work, urgent, personal)"
                  value={newTaskTags}
                  onChange={(e) => setNewTaskTags(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && addTask(addingSubtaskFor || undefined)}
                  className="flex-1 text-sm"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <Input
                  type="datetime-local"
                  placeholder="Set reminder (optional)"
                  value={newTaskReminder}
                  onChange={(e) => setNewTaskReminder(e.target.value)}
                  className="flex-1 text-sm"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div className="flex flex-wrap gap-2">
                  {TASK_COLORS.map((color) => (
                    <Button
                      key={color.value}
                      variant={newTaskColor === color.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewTaskColor(color.value)}
                      className={`${
                        newTaskColor === color.value
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : `${color.bg} ${color.border} ${color.text} hover:opacity-80`
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${color.bg.replace("bg-", "bg-").replace("dark:bg-", "")} border`}
                      />
                      {color.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {(allTags.length > 0 || usedColors.length > 1 || tasks.some((t) => t.reminderDate)) && (
          <Card className="mb-6 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-800 dark:text-purple-200 text-lg">Filters</CardTitle>
                {(selectedTags.length > 0 || selectedColors.length > 0 || selectedReminderFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.some((t) => t.reminderDate) && (
                <div>
                  <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Reminders</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "overdue", label: "Overdue", count: reminderStats.overdue },
                      { value: "today", label: "Due Today", count: reminderStats.today },
                      { value: "upcoming", label: "Upcoming", count: reminderStats.upcoming },
                      {
                        value: "with-reminders",
                        label: "With Reminders",
                        count: tasks.filter((t) => t.reminderDate).length,
                      },
                      {
                        value: "no-reminders",
                        label: "No Reminders",
                        count: tasks.filter((t) => !t.reminderDate).length,
                      },
                    ].map((filter) => (
                      <Button
                        key={filter.value}
                        variant={selectedReminderFilter === filter.value ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setSelectedReminderFilter(selectedReminderFilter === filter.value ? "" : filter.value)
                        }
                        className={`${
                          selectedReminderFilter === filter.value
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950"
                        }`}
                      >
                        <Bell className="w-3 h-3 mr-1" />
                        {filter.label} ({filter.count})
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {allTags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300">Tags</h4>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearTagFilters}
                        className="text-xs text-purple-600 hover:text-purple-700 h-auto p-1"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTagFilter(tag)}
                        className={`${
                          selectedTags.includes(tag)
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950"
                        }`}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {usedColors.length > 1 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300">Colors</h4>
                    {selectedColors.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearColorFilters}
                        className="text-xs text-purple-600 hover:text-purple-700 h-auto p-1"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {usedColors.map((colorValue) => {
                      const colorConfig = TASK_COLORS.find((c) => c.value === colorValue) || TASK_COLORS[0]
                      return (
                        <Button
                          key={colorValue}
                          variant={selectedColors.includes(colorValue) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleColorFilter(colorValue)}
                          className={`${
                            selectedColors.includes(colorValue)
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : `${colorConfig.bg} ${colorConfig.border} ${colorConfig.text} hover:opacity-80`
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${colorConfig.bg.replace("bg-", "bg-").replace("dark:bg-", "")} border`}
                          />
                          {colorConfig.name}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}

              {(selectedTags.length > 0 || selectedColors.length > 0 || selectedReminderFilter) && (
                <div className="text-sm text-purple-600 dark:text-purple-400 pt-2 border-t border-purple-200 dark:border-purple-800">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Active filters:
                  {selectedTags.length > 0 && ` Tags: ${selectedTags.join(", ")}`}
                  {selectedTags.length > 0 && (selectedColors.length > 0 || selectedReminderFilter) && " | "}
                  {selectedColors.length > 0 &&
                    ` Colors: ${selectedColors.map((c) => TASK_COLORS.find((tc) => tc.value === c)?.name || c).join(", ")}`}
                  {selectedColors.length > 0 && selectedReminderFilter && " | "}
                  {selectedReminderFilter && ` Reminders: ${selectedReminderFilter}`}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalCount}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                {selectedTags.length > 0 || selectedColors.length > 0 || selectedReminderFilter
                  ? "Filtered Tasks"
                  : "Total Tasks"}
              </div>
            </CardContent>
          </Card>
          <Card className="text-center border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCount}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Completed</div>
            </CardContent>
          </Card>
          <Card className="text-center border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {totalCount - completedCount}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Remaining</div>
            </CardContent>
          </Card>
        </div>

        {totalCount > 0 && (
          <Card className="mb-6 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Progress</span>
                <span className="text-sm text-purple-600 dark:text-purple-400">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-purple-100 dark:bg-purple-900" />
            </CardContent>
          </Card>
        )}

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-800 dark:text-purple-200">
              Your Tasks
              {(selectedTags.length > 0 || selectedColors.length > 0 || selectedReminderFilter) && (
                <span className="text-sm font-normal text-purple-600 dark:text-purple-400 ml-2">(Filtered)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visibleTasks.length === 0 ? (
              <div className="text-center py-8 text-purple-600 dark:text-purple-400">
                {tasks.length === 0
                  ? "No tasks yet. Add one above to get started!"
                  : "No tasks match the selected filters."}
              </div>
            ) : (
              <div className="space-y-3">
                {visibleTasks.map((task) => {
                  const colorStyles = getTaskColorStyles(task.color, task.completed)
                  const subtaskCount = getSubtaskCount(task.id)
                  const hasSubtasks = subtaskCount.total > 0

                  return (
                    <div key={task.id}>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${colorStyles.bg} ${colorStyles.border}`}
                        style={{ marginLeft: `${task.level * 24}px` }}
                      >
                        {hasSubtasks ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpansion(task.id)}
                            className="p-1 text-purple-600 hover:text-purple-700"
                          >
                            {task.isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        ) : (
                          <div className="w-8" />
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTask(task.id)}
                          className={`p-1 ${
                            task.completed
                              ? "text-green-600 hover:text-green-700"
                              : "text-purple-600 hover:text-purple-700"
                          }`}
                        >
                          {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </Button>

                        <div className="flex-1">
                          <div
                            className={`${
                              task.completed ? "line-through text-green-700 dark:text-green-300" : colorStyles.text
                            }`}
                          >
                            {task.title}
                            {hasSubtasks && (
                              <span className="ml-2 text-xs text-purple-500 dark:text-purple-400">
                                ({subtaskCount.completed}/{subtaskCount.total})
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700"
                              >
                                <Tag className="w-2 h-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {task.reminderDate && !task.completed && getReminderBadge(task.reminderDate)}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-purple-600 dark:text-purple-400 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Created {task.createdAt.toLocaleDateString()}
                            </div>
                            {task.reminderDate && (
                              <>
                                <Separator orientation="vertical" className="h-3" />
                                <div className="flex items-center gap-1">
                                  <Bell className="w-3 h-3" />
                                  Reminder {task.reminderDate.toLocaleDateString()} at{" "}
                                  {task.reminderDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </>
                            )}
                            {task.completed && task.completedAt && (
                              <>
                                <Separator orientation="vertical" className="h-3" />
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Completed {task.completedAt.toLocaleDateString()}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {task.completed && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            Completed
                          </Badge>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAddingSubtaskFor(task.id)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950"
                          title="Add subtask"
                        >
                          <Indent className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
