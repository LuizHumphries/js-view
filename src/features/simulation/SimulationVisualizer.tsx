import { buildSimulation } from '../../domain/simulation/buildSimulation'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectProgramBlocks } from '../program/programSlice'
import { setSteps } from './simulationSlice'

export default function SimulationVisualizer() {
    const dispatch = useAppDispatch()
    const blocks = useAppSelector(selectProgramBlocks)
    const steps = buildSimulation(blocks)

    function handleRunSimulation() {
        dispatch(setSteps(steps))
    }

    return (
        <div className="">
            <button
                onClick={() => handleRunSimulation()}
                type="button"
                className="h-10 w-full bg-accent-console"
            >
                AQUI
            </button>
        </div>
    )
}
