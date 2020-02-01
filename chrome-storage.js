import { generateId } from "./utils.js"
import { updateTask } from './index.js'

/**
 * Handles querying the chrome storage dynamically
 * @param {string} key - key used to locate required data in chrome storage
 * @param {object} query - type of database query
 * @param {function} callback - the required callback function
 * @param {object} data - optional data passed to the function
 */
export function queryChromeStorage(key, query, callback, data) {
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