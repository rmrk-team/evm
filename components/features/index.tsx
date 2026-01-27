import cn from "clsx"
import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import styles from "./style.module.css"

type FeatureProps = ComponentPropsWithoutRef<"div"> & {
  large?: boolean
  centered?: boolean
  lightOnly?: boolean
  href: string
  }

export function Feature({
  large,
  centered,
  children,
  lightOnly,
  className,
  href,
  ...props
}: FeatureProps) {
  return (
    <div
      className={cn(
        styles.feature,
        large && styles.large,
        centered && styles.centered,
        lightOnly && styles["light-only"],
        className,
        "dark:hover:nx-bg-neutral-800",
        "hover:nx-bg-slate-50",
      )}
      {...props}
    >
      <Link href={href}>{children}</Link>
    </div>
  )
}

export function Features({ children }: { children: ReactNode }) {
  return <div className={styles.features}>{children}</div>
}
