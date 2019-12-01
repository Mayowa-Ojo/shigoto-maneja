export function generateId() {
    let string = ""

    const build = () => {
        const next = JSON.stringify(Math.floor(Math.random() * 10))
        console.log(string)
        string+=next
        console.log(string)

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