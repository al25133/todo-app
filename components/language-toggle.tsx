"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      <div className="flex rounded-lg border border-purple-200 dark:border-purple-800 overflow-hidden">
        <Button
          variant={language === "ja" ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage("ja")}
          className={`rounded-none px-3 py-1 text-xs ${
            language === "ja"
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950"
          }`}
        >
          {t("language.japanese")}
        </Button>
        <Button
          variant={language === "en" ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage("en")}
          className={`rounded-none px-3 py-1 text-xs ${
            language === "en"
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950"
          }`}
        >
          {t("language.english")}
        </Button>
      </div>
    </div>
  )
}
