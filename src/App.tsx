import BlockList from './features/blocks/BlockList'
import GeneratedCodePanel from './features/code-panel/GeneratedCodePanel'
import ProgramSandBox from './features/program/ProgramSandBox'
import './styles/global.css'

export const App = () => (
    <div className="flex min-h-screen w-screen bg-bg-app p-4">
        <div className="flex w-full flex-row gap-4 rounded-2xl border border-accent-promiseThen bg-bg-app p-4">
            <BlockList />
            <div className="flex w-92 flex-col gap-2">
                <ProgramSandBox />
                <GeneratedCodePanel />
            </div>
        </div>
    </div>
)
