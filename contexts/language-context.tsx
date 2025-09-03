"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "ja" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  ja: {
    // Header
    "app.title": "Todo Master",
    "app.subtitle": "スタイリッシュにタスクを整理",

    // Reminder alerts
    "reminders.alerts": "リマインダーアラート",
    "reminders.overdue": "期限切れのタスク",
    "reminders.today": "今日が期限のタスク",
    "reminders.task": "タスク",
    "reminders.tasks": "タスク",

    // Add task form
    "task.add": "新しいタスクを追加",
    "task.addSubtask": "サブタスクを追加",
    "task.placeholder": "何をする必要がありますか？",
    "task.addButton": "追加",
    "task.addingSubtaskTo": "サブタスクを追加中：",
    "task.tagsPlaceholder": "タグを追加（カンマ区切り、例：仕事、緊急、個人）",
    "task.reminderPlaceholder": "リマインダーを設定（任意）",

    // Colors
    "color.default": "デフォルト",
    "color.red": "赤",
    "color.orange": "オレンジ",
    "color.yellow": "黄色",
    "color.green": "緑",
    "color.blue": "青",
    "color.indigo": "インディゴ",
    "color.pink": "ピンク",

    // Filters
    "filters.title": "フィルター",
    "filters.clearAll": "すべてクリア",
    "filters.reminders": "リマインダー",
    "filters.tags": "タグ",
    "filters.colors": "色",
    "filters.clear": "クリア",
    "filters.active": "アクティブなフィルター：",

    // Reminder filters
    "filter.overdue": "期限切れ",
    "filter.today": "今日期限",
    "filter.upcoming": "近日中",
    "filter.withReminders": "リマインダー付き",
    "filter.noReminders": "リマインダーなし",

    // Stats
    "stats.total": "総タスク数",
    "stats.filtered": "フィルター済みタスク",
    "stats.completed": "完了済み",
    "stats.remaining": "残り",
    "stats.progress": "進捗",

    // Task list
    "tasks.title": "あなたのタスク",
    "tasks.filtered": "（フィルター済み）",
    "tasks.empty": "まだタスクがありません。上記から追加して始めましょう！",
    "tasks.noMatch": "選択したフィルターに一致するタスクがありません。",
    "tasks.completed": "完了済み",
    "tasks.created": "作成日",
    "tasks.reminder": "リマインダー",
    "tasks.completedOn": "完了日",

    // Reminder badges
    "badge.overdue": "期限切れ",
    "badge.today": "今日期限",
    "badge.upcoming": "近日中",
    "badge.scheduled": "予定済み",

    // Language toggle
    "language.toggle": "言語切り替え",
    "language.japanese": "日本語",
    "language.english": "English",
  },
  en: {
    // Header
    "app.title": "Todo Master",
    "app.subtitle": "Organize your tasks with style",

    // Reminder alerts
    "reminders.alerts": "Reminder Alerts",
    "reminders.overdue": "overdue",
    "reminders.today": "due today",
    "reminders.task": "task",
    "reminders.tasks": "tasks",

    // Add task form
    "task.add": "Add New Task",
    "task.addSubtask": "Add Subtask",
    "task.placeholder": "What needs to be done?",
    "task.addButton": "Add",
    "task.addingSubtaskTo": "Adding subtask to:",
    "task.tagsPlaceholder": "Add tags (comma separated, e.g., work, urgent, personal)",
    "task.reminderPlaceholder": "Set reminder (optional)",

    // Colors
    "color.default": "Default",
    "color.red": "Red",
    "color.orange": "Orange",
    "color.yellow": "Yellow",
    "color.green": "Green",
    "color.blue": "Blue",
    "color.indigo": "Indigo",
    "color.pink": "Pink",

    // Filters
    "filters.title": "Filters",
    "filters.clearAll": "Clear All",
    "filters.reminders": "Reminders",
    "filters.tags": "Tags",
    "filters.colors": "Colors",
    "filters.clear": "Clear",
    "filters.active": "Active filters:",

    // Reminder filters
    "filter.overdue": "Overdue",
    "filter.today": "Due Today",
    "filter.upcoming": "Upcoming",
    "filter.withReminders": "With Reminders",
    "filter.noReminders": "No Reminders",

    // Stats
    "stats.total": "Total Tasks",
    "stats.filtered": "Filtered Tasks",
    "stats.completed": "Completed",
    "stats.remaining": "Remaining",
    "stats.progress": "Progress",

    // Task list
    "tasks.title": "Your Tasks",
    "tasks.filtered": "(Filtered)",
    "tasks.empty": "No tasks yet. Add one above to get started!",
    "tasks.noMatch": "No tasks match the selected filters.",
    "tasks.completed": "Completed",
    "tasks.created": "Created",
    "tasks.reminder": "Reminder",
    "tasks.completedOn": "Completed",

    // Reminder badges
    "badge.overdue": "Overdue",
    "badge.today": "Due Today",
    "badge.upcoming": "Upcoming",
    "badge.scheduled": "Scheduled",

    // Language toggle
    "language.toggle": "Language Toggle",
    "language.japanese": "日本語",
    "language.english": "English",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ja")

  useEffect(() => {
    const saved = localStorage.getItem("todo-app-language") as Language
    if (saved && (saved === "ja" || saved === "en")) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("todo-app-language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
