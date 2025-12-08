import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addTodo, clearCompleted, removeTodo, toggleTodo } from './todoSlice'

export default function TodoList() {
    const [title, setTitle] = useState('')
    const todos = useAppSelector((state) => state.todos.items)
    const dispatch = useAppDispatch()

    function handleAdd() {
        if (!title.trim()) return
        dispatch(addTodo(title.trim()))
        setTitle('')
    }
    return (
        <div className="bg-amber-400">
            <h2>Todo List</h2>

            <div>
                <input
                    value={title}
                    onChange={(event) => {
                        setTitle(event.target.value)
                    }}
                    placeholder="New todo"
                />
                <button onClick={handleAdd}>Add</button>
                <button onClick={() => dispatch(clearCompleted())}>Clear completed</button>
            </div>

            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => dispatch(toggleTodo(todo.id))}
                            />
                            {todo.title}
                        </label>
                        <button onClick={() => dispatch(removeTodo(todo.id))}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
