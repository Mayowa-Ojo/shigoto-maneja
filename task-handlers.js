import { appWillUpdate, updateTask, populateTaskCard } from "./index.js"
import { queryChromeStorage } from "./chrome-storage.js"
import { selectNodes, addEventListeners } from "./utils.js"

/**
 * Creates a task from the user input
 */
export function handleCreateTask() {
    const task = selectNodes().taskInput.value
    const taskInput = selectNodes().taskInput
    const query = {
        type: 'set'
    }
    const data = {
        update: task
    }
    // check if input field is empty
    if(task == '') {
        taskInput.classList.add('is-invalid')
        taskInput.placeholder = 'Please enter a task'
        return
    }
    // reset input field
    taskInput.classList.remove('is-invalid')
    taskInput.placeholder = 'Enter task here'

    // query chrome storage
    queryChromeStorage('tasks', query, populateTaskCard, data)
    // set input back to empty string
    selectNodes().taskInput.value = ""
}

/**
 * Handles toggling of task completion
 * @param {object} e - the event object
 */
export function handleTaskComplete(e) {
    const taskId = e.target.dataset.taskId
    const query = {
        type: 'update',
        update: 'toggle completed'
    }
    const data = {
        update: null,
        id: taskId
    }
    e.target.classList.toggle('checked')
    // update chrome storage
    queryChromeStorage('tasks', query, updateTask, data)
}

/**
 * Handles showing the task to the edited
 * @param {object} e - the event object
 */
export function handleShowTask(e) {
    const submitButton = selectNodes().submitButton
    const taskInput = selectNodes().taskInput
    // get id of current task
    const taskId = e.target.parentElement.parentElement.dataset.taskId
    // stop event bubbling
    e.stopPropagation()
    // get the current task
    const currentTask = e.target
    // console.log(currentTask)
    // set the input value to the subTask of the current task
    taskInput.value = currentTask.parentElement.parentElement.innerText.trim()
    // set focus to the input field
    taskInput.focus()
    // change edit icon to cancel
    e.target.classList.value = 'fas fa-window-close'
    // change button text
    submitButton.innerText = 'Update'
    // change icon color
    currentTask.style.color = 'indianred'
    // add new event listener
    submitButton.removeEventListener('click', handleCreateTask)
    currentTask.removeEventListener('click', handleShowTask)
    // add event listener to cancel icon
    addEventListeners(currentTask, 'click', handleCancelEditTask)
    addEventListeners(submitButton, 'click', handleEditTask)
    // store taskId in the input field
    taskInput.dataset.taskId = taskId
}

/**
 * Handles updating of a task
 */
export function handleEditTask() {
    // get user input
    const userInput = selectNodes().taskInput
    const taskId = selectNodes().taskInput.dataset.taskId
    const query = {
        type: 'update',
        update: 'edit'
    }
    const data = {
        update: userInput.value,
        id: taskId
    }
    // check if input field is empty
    if(userInput.value == '') {
        userInput.classList.add('is-invalid')
        userInput.placeholder = 'Please enter a task'
        return
    }
    // update chrome storage
    queryChromeStorage('tasks', query, updateTask, data)
    // re-render app
    appWillUpdate()
    // reset input field
    userInput.classList.remove('is-invalid')
    userInput.placeholder = 'Enter task here'
    userInput.value = ""
}

export function handleCancelEditTask(e) {
    const submitButton = selectNodes().submitButton
    const taskInput = selectNodes().taskInput
    const currentTask = e.target
    // stop event bubbling
    e.stopPropagation()
    // set input field to empty
    taskInput.value = ""
    // change cancel icon to edit 
    currentTask.classList.value = 'fas fa-pen-square'
    // change button text
    submitButton.innerText = 'Submit'
    // change icon color
    currentTask.style.color = '#495057'
    // add new event listener
    submitButton.removeEventListener('click', handleEditTask)
    currentTask.removeEventListener('click', handleCancelEditTask)
    addEventListeners(submitButton, 'click', handleCreateTask)
    addEventListeners(currentTask, 'click', handleShowTask)
}

/**
 * Handles the removal of a task from the chrome storage
 * @param {object} e - The event object
 */
export function handleDeleteTask(e) {
    // stop event from bubbling up
    e.stopPropagation()
    // console.log(e.target)
    // get id of current task
    const taskId = e.target.parentElement.parentElement.dataset.taskId
    const query = {
        type: 'update',
        update: 'delete'
    }
    const data = {
        update: null,
        id: taskId
    }
    // delete from chrome storage
    queryChromeStorage('tasks', query, updateTask, data)
    // re-render app
    appWillUpdate()
}