interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
  )
}
