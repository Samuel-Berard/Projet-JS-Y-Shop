const data = require("../data.json");

const getAllStudents = (req, res) => res.send(data)

const getStudentById = (req, res) => {
    const id = parseInt(req.params.id)
    const students = data.students
    const student = students.find(student => student.id === id)
    if (!student) {
        res.status(404).json({
            message: 'Student not found'
        })
    } else {
    const studentName = student.name
    res.status(200).json({
        message: 'Student found',
        studentName
    })
    }
}

module.exports = {getAllStudents, getStudentById}
