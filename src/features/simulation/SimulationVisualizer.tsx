import { buildSimulation } from '../../domain/simulation/buildstep'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { selectProgramBlocks } from '../program/programSlice'
import { setSteps } from './simulationSlice'

export default function SimulationVisualizer() {
    const dispatch = useAppDispatch()
    const blocks = useAppSelector(selectProgramBlocks)

    function handleRunSimulation() {
        const steps = buildSimulation(blocks)
        dispatch(setSteps(steps))
    }
    return (
        <div className="h-10 w-10 bg-white">
            <button onClick={() => handleRunSimulation()} type="button">
                AQUI
            </button>
        </div>
    )
}
