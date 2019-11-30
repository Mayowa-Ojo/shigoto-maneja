window.addEventListener('click', function() {
    // alert('This is a chrome extension')
    // chrome.storage.sync.set({message: "Chakra chrome extension is live"}, function() {
    //     alert("working...")
    // })

    // chrome.storage.sync.get(['message'], function(res) {
    //     alert(res.message)
    // })
    // console.log('clicked')
})

/**
 * Class representing the entire app
 */
class App {
    /**
     * Select DOM elements
     * @param {html} document - The html document
     */
    constructor(document) {
        this.sidebar = document.querySelector('.side-bar')
    }

    get elementNodes() {
        return({
            sidebar: this.sidebar,
        })
    }

    /**
     * Blueprint for handling events
     * @param {object} target - target DOM element
     * @param {string} event - type of event
     * @param {function} callback - event handler
     */
    addClickListeners(target, event, callback) {
        // check if the target is a node list
        if(target.length) {
            target.forEach(el => {
                el.addEventListener(event, callback)
            })
        } else {
            target.addEventListener(event, callback)
        }
    }
}

/**
 * Class representing a group of tasks
 * @extends App
 */
class Task extends App {
    /**
     * Select DOM elements
     * Add click listener to elements
     * @param {html} document - The html element
     */
    constructor(document) {
        super(document)

        this.subTasks = document.querySelectorAll('.todo-list-items .list-group-item')
        this.submitButton = document.querySelector('.input-group-append button')
        // this.inputElement = document.querySelector('.todo-card .input-group input')

        this.addClickListeners(this.subTasks, 'click', this.handleTaskComplete)
        this.addClickListeners(this.submitButton, 'click', this.handleAddTask)
    }

    get elementNodes() {
        return({
            subTasks: this.subTasks
        })
    }

    handleAddTask() {
        // grab the current user input
        const inputElement = document.querySelector('.todo-card .input-group input')
        const newTask = {
            title: inputElement.value,
            completed: false,
            timestamp: new Date().toISOString()
        }
        // console.log(inputElement.value)

        // check if the key value exists in chrome storage
        chrome.storage.sync.get(['tasks'], function(data) {
            if(Object.keys(data).length > 0) {
                // push new task unto array
                data.tasks.push(newTask)
                // set storage key to updated tasks
                chrome.storage.sync.set(data, function() {
                    console.log("tasks updated...")
                    // clear user input
                    inputElement.value = ""
                })
            } else {
                // create a new array for tasks and set in storage
                chrome.storage.sync.set({tasks: [newTask]}, function() {
                    console.log('task saved...')
                    // clear user input
                    inputElement.value = ""
                })
            }
        })
    }

    handleTaskComplete(e) {
        e.target.classList.toggle('checked')
    }
}

class SubTask extends Task {

}

window.onload = function() {
    console.log('Loaded...')
    console.log(document)

    // create an instance of the App class
    const app = new App(document)
    // create an instance of the Task class
    const task = new Task(document)
    // add click listeners to sub-tasks

    console.log(app.elementNodes)
    console.log(task.elementNodes)
}