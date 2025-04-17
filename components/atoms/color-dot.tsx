interface ColorDotProps {
  color: string
  size?: "sm" | "md" | "lg"
}

export function ColorDot({ color, size = "md" }: ColorDotProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return <div className={`${sizeClasses[size]} rounded-full`} style={{ backgroundColor: color }} />
}
