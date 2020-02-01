/**
 * Generates random id string
 * @returns {string} - generated id
 */
export function generateId() {
    let string = ""

    const build = () => {
        const next = JSON.stringify(Math.floor(Math.random() * 10))
        string+=next

        if(string.length > 6) {
            return
        } else {
            return build()
        }
    }
    build()
    // generate 2 random alphabets from character codes and replace with integer at index 2 and 4
    string = string.replace(string[2], String.fromCharCode(Math.floor(Math.random() * (90 - 65) + 65)))
    string = string.replace(string[4], String.fromCharCode(Math.floor(Math.random() * (90 - 65) + 65)))
    
    return string
}

/**
 * Handle selection of DOM elements
  * @returns {object} - collection of available DOM elements
 */
export function selectNodes() {
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
export function addEventListeners(target, event, callback) {
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