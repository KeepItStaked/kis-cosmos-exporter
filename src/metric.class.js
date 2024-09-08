export default class Metric {
    get() {
        return console.log("Error this metrics doesn't work!")
    }
    collect() {
        return this.get()
    }
}