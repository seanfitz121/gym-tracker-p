"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      toastOptions={{
        className: "group",
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-xl dark:group-[.toaster]:bg-gray-950 dark:group-[.toaster]:text-gray-50 dark:group-[.toaster]:border-gray-800 rounded-xl backdrop-blur-sm",
          description: "group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-400",
          actionButton: "group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50 dark:group-[.toast]:bg-gray-50 dark:group-[.toast]:text-gray-900",
          cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500 dark:group-[.toast]:bg-gray-800 dark:group-[.toast]:text-gray-400",
          success: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-green-50 group-[.toast]:to-emerald-50 group-[.toast]:border-green-200 dark:group-[.toast]:from-green-950/50 dark:group-[.toast]:to-emerald-950/50 dark:group-[.toast]:border-green-900",
          error: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-red-50 group-[.toast]:to-rose-50 group-[.toast]:border-red-200 dark:group-[.toast]:from-red-950/50 dark:group-[.toast]:to-rose-950/50 dark:group-[.toast]:border-red-900",
          warning: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-amber-50 group-[.toast]:to-orange-50 group-[.toast]:border-amber-200 dark:group-[.toast]:from-amber-950/50 dark:group-[.toast]:to-orange-950/50 dark:group-[.toast]:border-amber-900",
          info: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-blue-50 group-[.toast]:to-cyan-50 group-[.toast]:border-blue-200 dark:group-[.toast]:from-blue-950/50 dark:group-[.toast]:to-cyan-950/50 dark:group-[.toast]:border-blue-900",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 text-green-600 dark:text-green-400" />,
        info: <InfoIcon className="size-5 text-blue-600 dark:text-blue-400" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-600 dark:text-amber-400" />,
        error: <OctagonXIcon className="size-5 text-red-600 dark:text-red-400" />,
        loading: <Loader2Icon className="size-5 animate-spin text-blue-600 dark:text-blue-400" />,
      }}
      offset="16px"
      duration={3000}
      gap={8}
      {...props}
    />
  )
}

export { Toaster }
