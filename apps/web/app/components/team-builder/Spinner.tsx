type SpinnerProps = {
    label?: string;
}

export const Spinner = ({ label }: SpinnerProps) => {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
            {label && <p className="text-sm text-muted-light">{label}</p>}
        </div>
    )
}
