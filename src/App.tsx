import { useMemo, useState } from 'react'
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

type PanelTab = 'montagem' | 'execucao'

function AppInner() {
    const [panelTab, setPanelTab] = useState<PanelTab>('montagem')
    const [isBlocksOpen, setIsBlocksOpen] = useState<boolean>(false)
    const [isCodeOpen, setIsCodeOpen] = useState<boolean>(false)

    const isStale = useAppSelector(selectIsSimulationStale)
    const currentBlockHash = useAppSelector(selectCurrentBlockHash)

    const toast = Toast.useToastManager()

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
        <div className="flex h-dvh w-full overflow-hidden bg-bg-app p-2 sm:p-4">
            <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden rounded-2xl border border-accent-promiseThen bg-bg-app p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-bg-block-hover px-3 py-2">
                    <div className="flex items-center gap-1 rounded-lg bg-bg-block p-1">
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

                    <div className="flex items-center gap-2">
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

                <div className="min-h-0 flex-1 overflow-hidden">{panelNode}</div>

                {isBlocksOpen && (
                    <div className="fixed inset-0 z-50">
                        <Button
                            type="button"
                            aria-label="Fechar blocos"
                            onClick={() => setIsBlocksOpen(false)}
                            className="absolute inset-0 bg-black/60"
                        />

                        <div className="absolute right-0 bottom-0 left-0 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl border border-border-subtle bg-bg-panel p-3 md:inset-y-0 md:left-auto md:max-h-none md:w-[420px] md:rounded-t-none md:rounded-l-2xl">
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
                        </div>
                    </div>
                )}

                {isCodeOpen && (
                    <div className="fixed inset-0 z-50">
                        <Button
                            type="button"
                            aria-label="Fechar código"
                            onClick={() => setIsCodeOpen(false)}
                            className="absolute inset-0 bg-black/60"
                        />

                        <div className="absolute inset-0 flex flex-col overflow-hidden border border-border-subtle bg-bg-panel p-3 md:inset-y-0 md:left-auto md:w-[560px] md:rounded-l-2xl">
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
                        </div>
                    </div>
                )}
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
