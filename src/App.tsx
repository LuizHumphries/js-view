import BlockList from './features/blocks/BlockList'
import GeneratedCodePanel from './features/code-panel/GeneratedCodePanel'
import ProgramSandBox from './features/program/ProgramSandBox'
import SimulationVisualizer from './features/simulation/SimulationVisualizer'
import './styles/global.css'

export const App = () => (
    <div className="flex min-h-screen w-screen bg-bg-app p-4">
        <div className="flex w-full flex-row gap-4 rounded-2xl border border-accent-promiseThen bg-bg-app p-4">
            <BlockList />
            <div className="flex w-92 flex-col justify-between gap-4">
                <ProgramSandBox />
                <GeneratedCodePanel />
            </div>
            <SimulationVisualizer />
        </div>
    </div>
)
