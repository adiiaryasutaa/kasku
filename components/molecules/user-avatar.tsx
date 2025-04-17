import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  name: string
  avatarUrl?: string
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({ name, avatarUrl, size = "md" }: UserAvatarProps) {
  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl || ""} alt={name} />
      <AvatarFallback>{getAvatarFallback(name)}</AvatarFallback>
    </Avatar>
  )
}
