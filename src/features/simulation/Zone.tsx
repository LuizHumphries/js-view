import { cn } from '../../utils/cn'

type ZoneVariant = 'callstack' | 'microtask' | 'webapi' | 'macrotask'

type ZoneProps = {
    title: string
    variant?: ZoneVariant
    children: React.ReactNode
}

const variantStyles: Record<ZoneVariant, string> = {
    callstack: 'border-zone-callstack/40 bg-zone-callstack/15',
    microtask: 'border-zone-microtask/40 bg-zone-microtask/15',
    webapi: 'border-zone-webapi/40 bg-zone-webapi/15',
    macrotask: 'border-zone-macrotask/40 bg-zone-macrotask/15',
}
const titleStyles: Record<ZoneVariant, string> = {
    callstack: 'text-zone-callstack/70',
    microtask: 'text-zone-microtask/70',
    webapi: 'text-zone-webapi/70',
    macrotask: 'text-zone-macrotask/70',
}

export default function Zone({ title, variant = 'callstack', children }: ZoneProps) {
    const variantStyle = variantStyles[variant]
    const titleStyle = titleStyles[variant]

    return (
        <section
            className={cn(
                'flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-panel p-2 sm:p-3',
                'min-h-[72px] sm:min-h-[110px]',
                variantStyle,
            )}
        >
            <header className="mb-2 flex items-center justify-between gap-2">
                <h3
                    className={cn(
                        'text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase',
                        titleStyle,
                    )}
                >
                    {title}
                </h3>
            </header>
            <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-x-hidden overflow-y-auto sm:gap-2">
                {children}
            </div>
        </section>
    )
}
