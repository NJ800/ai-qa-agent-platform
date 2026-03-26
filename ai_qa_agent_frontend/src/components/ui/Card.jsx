export function Card({ children, className = "", ...props }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-700 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ children, className = "", ...props }) {
  return <h3 className={`text-lg font-semibold text-slate-800 dark:text-slate-100 ${className}`} {...props}>{children}</h3>;
}

export function CardContent({ children, className = "", ...props }) {
  return <div className={`px-6 py-4 ${className}`} {...props}>{children}</div>;
}

export function CardFooter({ children, className = "", ...props }) {
  return <div className={`px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 ${className}`} {...props}>{children}</div>;
}
