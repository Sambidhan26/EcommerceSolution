interface ErrorMessageProps { message: string }

export function ErrorMessage({ message }: ErrorMessageProps) {
  return <p className="error" role="alert">{message}</p>
}
