interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="rounded-card border border-brand-pink bg-brand-pink-light px-4 py-3">
      <p className="text-[14px] text-brand-pink">{message}</p>
    </div>
  );
}
