// Imports
import { selectNodes, addEventListeners } from "./utils.js"
import { queryChromeStorage } from "./chrome-storage.js"
import { 
    handleCreateTask, 
    handleTaskComplete, 
    handleShowTask, 
    handleDeleteTask
} from "./task-handlers.js"

// Initialize app
window.onload = function() {
    console.log('Loading...')
    appWillInitialize()
}

/**
 * Handles update of task fields
 * @param {object} slug - the tasks object
 * @param {string} query - the type of update
 * @param {any} update - the desired update
 * @param {string} id - the id of the targetted task
 * @returns {object} - updated tasks object
 */
export function updateTask(slug, query, update, id) {
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
    // add click listeners
    addEventListeners(listItem, 'click', handleTaskComplete)
    addEventListeners(Array.from(listItem.lastElementChild.children)[0], 'click', handleShowTask)
    addEventListeners(Array.from(listItem.lastElementChild.children)[1], 'click', handleDeleteTask)
    // append to the unordered list node
    taskListNode.append(listItem)
}

/**
 * Calls the createTaskNode function to create a DOM node with specified data
 * @param {object} data - the task data retrieved from chrome storage
 */
export function populateTaskCard(data) {
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
 * Re-render the DOM when changes are detected
 */
export function appWillUpdate() {
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
                addEventListeners(selectNodes().submitButton, 'click', handleCreateTask)
            }
            // add click listeners to edit and delete buttons
            addEventListeners(selectNodes().deleteButtons, 'click', handleDeleteTask)
            // addEventListeners(selectNodes().editButtons, 'click', handleEditTask)
            addEventListeners(selectNodes().editButtons, 'click', handleShowTask)
        })
}