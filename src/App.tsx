import { useEffect, useMemo, useState } from 'react'
import { Button } from '@base-ui-components/react'
import { Toast } from '@base-ui-components/react/toast'
import BlockList from './features/blocks/BlockList'
import GeneratedCodePanel from './features/code-panel/GeneratedCodePanel'
import ProgramSandBox from './features/program/ProgramSandBox'
import SimulationVisualizer from './features/simulation/SimulationVisualizer'
import './styles/global.css'
import { useAppSelector } from './store/hooks'
import { selectCurrentBlockHash, selectIsSimulationStale } from './features/simulation/selector'
import BuildSimulationButton from './features/simulation/BuildSimulationButton'
import { AnimatePresence, motion } from 'framer-motion'

type PanelTab = 'montagem' | 'execucao'

function AppInner() {
    const [panelTab, setPanelTab] = useState<PanelTab>('montagem')
    const [isBlocksOpen, setIsBlocksOpen] = useState<boolean>(false)
    const [isCodeOpen, setIsCodeOpen] = useState<boolean>(false)
    const [isMdUp, setIsMdUp] = useState<boolean>(() => {
        if (typeof window === 'undefined') return true
        if (!('matchMedia' in window)) return true
        return window.matchMedia('(min-width: 768px)').matches
    })

    const isStale = useAppSelector(selectIsSimulationStale)
    const currentBlockHash = useAppSelector(selectCurrentBlockHash)

    const toast = Toast.useToastManager()

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (!('matchMedia' in window)) return
        const mql = window.matchMedia('(min-width: 768px)')
        const onChange = () => setIsMdUp(mql.matches)
        onChange()
        mql.addEventListener('change', onChange)
        return () => mql.removeEventListener('change', onChange)
    }, [])

    const panelNode = useMemo(() => {
        switch (panelTab) {
            case 'montagem':
                return <ProgramSandBox />
            case 'execucao':
            default:
                return <SimulationVisualizer />
        }
    }, [panelTab])

    return (
        <div className="flex min-h-dvh w-full overflow-x-hidden bg-bg-app p-2 sm:p-4 lg:h-dvh lg:overflow-hidden">
            <div className="flex w-full flex-col gap-3 rounded-2xl border border-accent-promiseThen bg-bg-app p-3 sm:p-4 lg:h-full lg:min-h-0 lg:overflow-hidden">
                <div className="flex flex-col gap-2 rounded-xl bg-bg-block-hover px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    {/* Tabs: em telas pequenas vira select para não estourar layout */}
                    <div className="hidden items-center gap-1 rounded-lg bg-bg-block p-1 sm:flex">
                        <Button
                            type="button"
                            onClick={() => setPanelTab('montagem')}
                            className={[
                                'rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                                panelTab === 'montagem'
                                    ? 'bg-bg-panel text-text-primary'
                                    : 'text-text-muted hover:bg-bg-block-hover hover:text-text-primary',
                            ].join(' ')}
                        >
                            Montagem
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setPanelTab('execucao')}
                            className={[
                                'rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                                panelTab === 'execucao'
                                    ? 'bg-bg-panel text-text-primary'
                                    : 'text-text-muted hover:bg-bg-block-hover hover:text-text-primary',
                            ].join(' ')}
                        >
                            Execução
                        </Button>
                    </div>

                    <div className="sm:hidden">
                        <label className="sr-only" htmlFor="panel-tab-select">
                            Selecionar painel
                        </label>
                        <select
                            id="panel-tab-select"
                            value={panelTab}
                            onChange={(e) => setPanelTab(e.target.value as PanelTab)}
                            className="w-full rounded-lg border border-border-subtle bg-bg-block px-3 py-2 text-sm text-text-primary"
                        >
                            <option value="montagem">Montagem</option>
                            <option value="execucao">Execução</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                        <BuildSimulationButton
                            currentBlockHash={currentBlockHash}
                            isStale={isStale}
                            onBuilt={() => {
                                setPanelTab('execucao')
                                toast.add({
                                    type: 'success',
                                    title: 'Simulação gerada',
                                    description: 'Pronto! Você já pode dar play.',
                                    timeout: 3500,
                                })
                            }}
                            onEmpty={() => {
                                setPanelTab('montagem')
                                toast.add({
                                    type: 'warning',
                                    title: 'Nada para gerar',
                                    description: 'Adicione pelo menos 1 bloco na montagem.',
                                    timeout: 4000,
                                    priority: 'high',
                                })
                            }}
                            onError={(message) => {
                                toast.add({
                                    type: 'error',
                                    title: 'Falha ao gerar simulação',
                                    description: message,
                                    timeout: 5000,
                                    priority: 'high',
                                })
                            }}
                        />

                        <Button
                            type="button"
                            onClick={() => setIsBlocksOpen(true)}
                            className="rounded-md bg-bg-block px-3 py-1.5 text-sm whitespace-nowrap text-text-primary"
                        >
                            Blocos
                        </Button>

                        <Button
                            type="button"
                            onClick={() => setIsCodeOpen(true)}
                            className="rounded-md bg-bg-block px-3 py-1.5 text-sm whitespace-nowrap text-text-primary"
                        >
                            Código
                        </Button>
                    </div>
                </div>

                <div className="flex-1 lg:min-h-0 lg:overflow-hidden">{panelNode}</div>

                <AnimatePresence>
                    {isBlocksOpen ? (
                        <motion.div
                            className="fixed inset-0 z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.button
                                type="button"
                                aria-label="Fechar blocos"
                                onClick={() => setIsBlocksOpen(false)}
                                className="absolute inset-0 bg-black/60"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />

                            <motion.div
                                className="absolute right-0 bottom-0 left-0 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl border border-border-subtle bg-bg-panel p-3 md:inset-y-0 md:left-auto md:max-h-none md:w-[420px] md:rounded-t-none md:rounded-l-2xl"
                                initial={isMdUp ? { x: 18, opacity: 0 } : { y: 18, opacity: 0 }}
                                animate={isMdUp ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                                exit={isMdUp ? { x: 18, opacity: 0 } : { y: 18, opacity: 0 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <h2 className="text-xs font-semibold tracking-wide text-text-primary uppercase">
                                        Blocos
                                    </h2>
                                    <Button
                                        type="button"
                                        onClick={() => setIsBlocksOpen(false)}
                                        className="rounded-md bg-bg-block px-3 py-1.5 text-sm whitespace-nowrap text-text-primary"
                                    >
                                        Fechar
                                    </Button>
                                </div>

                                <div className="min-h-0 flex-1 overflow-y-auto">
                                    <BlockList
                                        fullWidth
                                        showHeader={false}
                                        onBlockAdded={() => {
                                            setPanelTab('montagem')
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <AnimatePresence>
                    {isCodeOpen ? (
                        <motion.div
                            className="fixed inset-0 z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.button
                                type="button"
                                aria-label="Fechar código"
                                onClick={() => setIsCodeOpen(false)}
                                className="absolute inset-0 bg-black/60"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />

                            <motion.div
                                className="absolute inset-0 flex flex-col overflow-hidden border border-border-subtle bg-bg-panel p-3 md:inset-y-0 md:left-auto md:w-[560px] md:rounded-l-2xl"
                                initial={isMdUp ? { x: 18, opacity: 0 } : { y: 18, opacity: 0 }}
                                animate={isMdUp ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                                exit={isMdUp ? { x: 18, opacity: 0 } : { y: 18, opacity: 0 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <h2 className="text-xs font-semibold tracking-wide text-text-primary uppercase">
                                        Código gerado
                                    </h2>
                                    <Button
                                        type="button"
                                        onClick={() => setIsCodeOpen(false)}
                                        className="rounded-md bg-bg-block px-3 py-1.5 text-sm whitespace-nowrap text-text-primary"
                                    >
                                        Fechar
                                    </Button>
                                </div>

                                <div className="min-h-0 flex-1 overflow-hidden">
                                    <GeneratedCodePanel showHeader={false} />
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            {/* Toasts devem ser independentes do layout: Portal + Viewport + Roots dentro do viewport */}
            <Toast.Portal>
                <Toast.Viewport className="fixed top-3 left-1/2 z-9999 flex w-[360px] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 flex-col gap-2 outline-none">
                    {toast.toasts.map((t) => {
                        const accent =
                            t.type === 'success'
                                ? 'border-accent-success/40'
                                : t.type === 'warning'
                                  ? 'border-accent-gold/40'
                                  : 'border-red-500/40'

                        return (
                            <Toast.Root
                                key={t.id}
                                toast={t}
                                className={[
                                    'rounded-xl border bg-bg-panel/95 p-3 shadow-lg backdrop-blur',
                                    'data-[state=open]:animate-in data-[state=closed]:animate-out',
                                    accent,
                                ].join(' ')}
                            >
                                <Toast.Content className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <Toast.Title className="text-sm font-semibold text-text-primary" />
                                        <Toast.Description className="mt-0.5 text-xs text-text-muted" />
                                    </div>
                                    <Toast.Close className="rounded-md bg-bg-block px-2 py-1 text-xs text-text-primary">
                                        Fechar
                                    </Toast.Close>
                                </Toast.Content>
                            </Toast.Root>
                        )
                    })}
                </Toast.Viewport>
            </Toast.Portal>
        </div>
    )
}

export const App = () => {
    return (
        <Toast.Provider>
            <AppInner />
        </Toast.Provider>
    )
}
