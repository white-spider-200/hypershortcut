"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  activeTab?: string
  onTabChange?: (name: string) => void
}

export function NavBar({ items, className, activeTab: externalActiveTab, onTabChange }: NavBarProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(items[0].name)
  const activeTab = externalActiveTab || internalActiveTab
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-zinc-950/60 border border-white/10 backdrop-blur-xl py-2 px-2 rounded-full shadow-2xl">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <a
              key={item.name}
              href={item.url}
              onClick={(e) => {
                e.preventDefault();
                if (onTabChange) {
                  onTabChange(item.name);
                } else {
                  setInternalActiveTab(item.name);
                }
              }}
              className={cn(
                "relative cursor-pointer text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-300",
                "text-zinc-400 hover:text-white",
                isActive && "text-cyan-400",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-white/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-cyan-400 rounded-t-full shadow-[0_-2px_10px_rgba(34,211,238,0.8)]">
                    <div className="absolute w-16 h-8 bg-cyan-400/20 rounded-full blur-xl -top-4 -left-3" />
                    <div className="absolute w-10 h-6 bg-cyan-400/20 rounded-full blur-lg -top-2" />
                  </div>
                </motion.div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
