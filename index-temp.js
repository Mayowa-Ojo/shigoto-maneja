// Imports
import { generateId } from "./utils.js"

// Initialize app
window.onload = function() {
    console.log('Loading...')
    initializeApp()
}

function selectNodes() {
    const sidebar = document.querySelector('.side-bar')
    const subTasks = document.querySelectorAll('.todo-list-items .list-group-item')
    const submitButton = document.querySelector('.input-group-append button')
    const taskList = document.querySelector('.todo-card .todo-list-items')
    const taskInput = document.querySelector('.todo-card .input-group input')
    // const taskId = document.querySelector('')

    return({
        sidebar,
        subTasks,
        submitButton,
        taskList,
        taskInput
    })
}

function addEventListeners(target, event, callback) {
     // check if the target is a node list
     if(target.length) {
        target.forEach(el => {
            el.addEventListener(event, callback)
        })
    } else {
        target.addEventListener(event, callback)
    }
}

function handleTaskComplete(e) {
    const taskId = { id: e.target.dataset.taskId }
    e.target.classList.toggle('checked')
    // update chrome storage
    queryChromeStorage('tasks', 'update', updateTask, taskId)
}

function updateTask(task, key, update) {
    // update task based on parameters and return object
    task[key] = update
    return task
}

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
    // set data attribute
    listItem.dataset.taskId = task.id
    // add innerHTML
    listItem.innerHTML = innerHTML
    // add click listener
    addEventListeners(listItem, 'click', handleTaskComplete)
    // append to the unordered list node
    taskListNode.append(listItem)
}

function queryChromeStorage(key, query, callback, data) {
    // check if it's a get, set or update query
    if(query == 'get') {
        chrome.storage.sync.get([key], function(slug) {
            callback(slug)
        })
    } else if(query == 'set') {
        const newTask = {
            subTask: data,
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
            } else {
                chrome.storage.sync.set({tasks: [newTask]})
                // update task list
                callback(newTask)
            }
        })
    } else if(query == 'update') {
        // find the specific task
        chrome.storage.sync.get([key], function(slug) {
            const task = slug.tasks.find(task => task.id == data.id)
            const updatedTask = updateTask(task, 'completed', true)
            const updateIndex = slug.tasks.findIndex(task => task.id == data.id)
            // update data at index
            slug.tasks[updateIndex] = updatedTask
            // update chrome storage
            // chrome.storage.sync.set(data)
            console.log(slug)
        })
    }
}

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

function createTask() {
    const task = selectNodes().taskInput.value
    queryChromeStorage('tasks', 'set', populateTaskCard, task)
    // set input back to empty string
    selectNodes().taskInput.value = ""

}

function initializeApp() {
    // load tasks on render
    queryChromeStorage('tasks', 'get', populateTaskCard)
    // add click listener to submit button
    addEventListeners(selectNodes().submitButton, 'click', createTask)

}