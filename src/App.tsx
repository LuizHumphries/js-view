import BlockList from './features/blocks/BlockList'
import ProgramSandBox from './features/program/ProgramSandBox'
import './styles/global.css'

export const App = () => (
    <div className="flex flex-row">
        <BlockList />
        <ProgramSandBox />
    </div>
)
