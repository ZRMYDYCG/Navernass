import Image from 'next/image'

interface IconProps {
  name: string
  size?: number
  className?: string
}

export function Icon({ name, size = 24, className = '' }: IconProps) {
  // 根据 name 映射到对应的 SVG 文件路径
  const iconPath = `/assets/svg/${name}.svg`

  return (
    <Image src={iconPath} alt={name} width={size} height={size} className={className} priority />
  )
}
