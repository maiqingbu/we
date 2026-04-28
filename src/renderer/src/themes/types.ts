export interface ThemeStyles {
  container: React.CSSProperties
  p: React.CSSProperties
  h1: React.CSSProperties
  h2: React.CSSProperties
  h3: React.CSSProperties
  h4: React.CSSProperties
  strong: React.CSSProperties
  em: React.CSSProperties
  u: React.CSSProperties
  s: React.CSSProperties
  a: React.CSSProperties
  ul: React.CSSProperties
  ol: React.CSSProperties
  li: React.CSSProperties
  blockquote: React.CSSProperties
  code: React.CSSProperties
  pre: React.CSSProperties
  preCode: React.CSSProperties
  hr: React.CSSProperties
  img: React.CSSProperties
  table: React.CSSProperties
  th: React.CSSProperties
  td: React.CSSProperties
  taskList: React.CSSProperties
  taskItem: React.CSSProperties
}

export interface Theme {
  id: string
  name: string
  description: string
  styles: ThemeStyles
  customCss?: string  // For custom themes - raw CSS string
  previewImage?: string  // Theme thumbnail preview image URL
  headerImage?: string  // Theme header banner image URL (displayed at top of articles)
  headerText?: HeaderTextConfig  // Text overlay on header banner
}

export interface HeaderTextConfig {
  title?: string       // Main title text (empty string or undefined = no title)
  subtitle?: string    // Subtitle text
  color?: string       // Text color (default: white)
  align?: 'left' | 'center' | 'right'  // Text alignment (default: left)
  position?: 'top' | 'center' | 'bottom'  // Vertical position (default: bottom)
}
