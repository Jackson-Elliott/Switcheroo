type Props = {
  className?: string
}

export default function AuthorCreditLink({ className = '' }: Props) {
  return (
    <a
      href="https://willandjackson.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`credit-link relative inline-block text-xs font-medium text-zesty ${className}`.trim()}
    >
      Made by Jackson Elliott
    </a>
  )
}
