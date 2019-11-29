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

class App {
    constructor(document) {
        this.sidebar = document.querySelector('.side-bar')
    }

    get elementNodes() {
        return({
            sidebar: this.sidebar,
        })
    }

    addClickListeners(target, callback) {
        target.forEach(el => {
            el.addEventListener('click', callback)
        })
    }

    // handleDOMEvent(e) {
    //     console.log(e.target)
    // }
}

class Task extends App {
    constructor(document) {
        super(document)

        this.subTasks = document.querySelectorAll('.todo-list-items .list-group-item')
        this.addClickListeners(this.subTasks, this.handleTaskComplete)
    }

    get elementNodes() {
        return({
            subTasks: this.subTasks
        })
    }

    handleAddTask() {

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
    // app.addClickListeners()

    console.log(app.elementNodes)
    console.log(task.elementNodes)
}