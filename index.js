// Imports
import { generateId } from "./utils.js"

// Initialize app
window.onload = function() {
    console.log('Loading...')
    appWillInitialize()
}

/**
 * Handle selection of DOM elements
  * @returns {object} - collection of available DOM elements
 */
function selectNodes() {
    const sidebar = document.querySelector('.side-bar')
    const subTasks = document.querySelectorAll('.todo-list-items .list-group-item')
    const submitButton = document.querySelector('.input-group-append button')
    const taskList = document.querySelector('.todo-card .todo-list-items')
    const taskInput = document.querySelector('.todo-card .input-group input')
    const editButtons = document.querySelectorAll('.todo-list-items .list-group-item span:nth-child(2) i:first-child')
    const deleteButtons = document.querySelectorAll('.todo-list-items .list-group-item span:nth-child(2) i:nth-child(2)')

    return({
        sidebar,
        subTasks,
        submitButton,
        taskList,
        taskInput,
        editButtons,
        deleteButtons
    })
}

/**
 * Blueprint for add event listeners 
 * @param {object} target - DOM element
 * @param {string} event - type of event
 * @param {function} callback - the event listener callback
 */
function addEventListeners(target, event, callback) {
    // console.log(target)
    // check if the target is a node list
    if(target.length) {
        target.forEach(el => {
            el.addEventListener(event, callback)
        })
    } else {
        target.addEventListener(event, callback)
    }
}

/**
 * Handles update of task fields
 * @param {object} slug - the tasks object
 * @param {string} query - the type of update
 * @param {any} update - the desired update
 * @param {string} id - the id of the targetted task
 * @returns {object} - updated tasks object
 */
function updateTask(slug, query, update, id) {
    // find current task by id
    const task = slug.tasks.find(task => task.id == id)
    // update task based on parameters and return object
    switch(query) {
        case 'edit':
            task.subTask = update
            break;
        case 'delete':
            slug.tasks = slug.tasks.filter(task => task.id !== id)
            break;
        case 'toggle completed':
            task['completed'] = !task.completed
            break;
        default:
            console.log('incorrect query type');
    }
    return slug
}

/**
 * Creates a task node and appends to the DOM
 * @param {object} task - the current task object
 */
function createTaskNode(task) {
    const taskListNode = selectNodes().taskList
    const innerHTML = `
        <span>
            <i class="far fa-check-circle"></i>
        </span> ${task.subTask}
        <span>
            <i class="fas fa-pen-square"></i> 
            <i class="fas fa-trash-restore"></i>
        </span>
    `
    // create a list item node
    const listItem = document.createElement('li')
    // add required classes
    listItem.classList.add('list-group-item', 'list-group-item-action')
    // check if task is completed and add 'checked' class
    if(task.completed) {
        listItem.classList.add('checked')
    }
    // set data attribute
    listItem.dataset.taskId = task.id
    // add innerHTML
    listItem.innerHTML = innerHTML
    // add click listener
    addEventListeners(listItem, 'click', handleTaskComplete)
    // append to the unordered list node
    taskListNode.append(listItem)
}

/**
 * Handles querying the chrome storage dynamically
 * @param {string} key - key used to locate required data in chrome storage
 * @param {object} query - type of database query
 * query = {
    * type: 'set',
    * update: 'edit'
 * }
 * @param {function} callback - the required callback function
 * @param {object} data - optional data passed to the function
 */
function queryChromeStorage(key, query, callback, data) {
    return new Promise(function(resolve, reject) {
        // check if it's a get, set or update query
        if(query.type == 'get') {
            chrome.storage.sync.get([key], function(slug) {
                callback(slug)
                resolve('fields populated')
            })
        } else if(query.type == 'set') {
            // console.log(data)
    
            const newTask = {
                subTask: data.update,
                completed: false,
                timestamp: new Date().toISOString(),
                id: generateId()
            }
            chrome.storage.sync.get([key], function(slug) {
                // check if there's existing data
                if(Object.keys(slug).length > 0) {
                    // append new task to existing data
                    slug.tasks.push(newTask)
                    chrome.storage.sync.set(slug)
                    // update task list
                    callback(newTask)
                    resolve('chrome storage updated')
                } else {
                    chrome.storage.sync.set({tasks: [newTask]})
                    // update task list
                    callback(newTask)
                    resolve('chrome storage updated')
                }
            })
        } else if(query.type == 'update') {
            // find the specific task
            chrome.storage.sync.get([key], function(slug) {
                // update task field
                const updatedTask = updateTask(slug, query.update, data.update, data.id)
                // update chrome storage
                chrome.storage.sync.set(updatedTask)
                // console.log(updatedTask)
            })
        } else {
            reject('wrong query type')
        }
    })
}

/**
 * Calls the createTaskNode function to create a DOM node with specified data
 * @param {object} data - the task data retrieved from chrome storage
 */
function populateTaskCard(data) {
    // check if there is data in chrome storage
    if(data.tasks !== undefined) {
        // loop through data and call createTaskNode function
        data.tasks.forEach(task => {
            createTaskNode(task)
        })
    } else {
        createTaskNode(data)
    }
}

/**
 * Creates a task from the user input
 */
function createTask() {
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
    // remove is-invalid class if exists
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
function handleTaskComplete(e) {
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
function showTaskEdit(e) {
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
    submitButton.removeEventListener('click', createTask)
    currentTask.removeEventListener('click', showTaskEdit)
    // add event listener to cancel icon
    addEventListeners(currentTask, 'click', cancelEditTask)
    addEventListeners(submitButton, 'click', handleEditTask)
    // store taskId in the input field
    taskInput.dataset.taskId = taskId
}

/**
 * Handles updating of a task
 */
function handleEditTask() {
    // get user input
    const userInput = selectNodes().taskInput.value
    const taskId = selectNodes().taskInput.dataset.taskId
    const query = {
        type: 'update',
        update: 'edit'
    }
    const data = {
        update: userInput,
        id: taskId
    }
    // update chrome storage
    queryChromeStorage('tasks', query, updateTask, data)
    // re-render app
    appWillUpdate()
}

function cancelEditTask(e) {
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
    currentTask.removeEventListener('click', cancelEditTask)
    addEventListeners(submitButton, 'click', createTask)
    addEventListeners(currentTask, 'click', showTaskEdit)
}

/**
 * Handles the removal of a task from the chrome storage
 * @param {object} e - The event object
 */
function handleDeleteTask(e) {
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

/**
 * Re-render the DOM when changes are detected
 */
function appWillUpdate() {
    // console.log('updating DOM')
    // remove tasks from DOM
    const taskListNode = selectNodes().taskList
    // convert HTMLcollection to an iterable
    const iterable = [...taskListNode.children]
    iterable.forEach(child => {
        child.remove()
    })
    // append updated tasks to DOM
    setTimeout(() => {
        appWillInitialize()
    }, 200);
}

/**
 * Start up the application and setup initial render
 */
function appWillInitialize() {
    const query = {
        type: 'get'
    }
    // load tasks on render
    queryChromeStorage('tasks', query, populateTaskCard)
        .then(val => {
            // add click listener to submit button
            // check if it's a new task or an update
            if(selectNodes().submitButton.innerText = 'Submit') {
                addEventListeners(selectNodes().submitButton, 'click', createTask)
            }
            // add click listeners to edit and delete buttons
            addEventListeners(selectNodes().deleteButtons, 'click', handleDeleteTask)
            // addEventListeners(selectNodes().editButtons, 'click', handleEditTask)
            addEventListeners(selectNodes().editButtons, 'click', showTaskEdit)
        })
}