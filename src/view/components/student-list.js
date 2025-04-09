const backend_url = 'http://localhost:3001/students';

const studentTemplate = document.querySelector('#student-template');
const studentList = document.querySelector('#students');

let students = [];

// --- function declarations ---

function getStudents() {
  return fetch(backend_url)
    .then((response) => response.json())
    .then((data) => {
      students = [...data];
      render();
    });
}

function editStudentEvent(student, event) {
  console.log('editStudentEvent event:', event);
  console.log('editStudentEvent student', student);

  // create a new custom event to inform the student-form component that we want to edit a student
  const editStudentEvent = new CustomEvent('edit-student', {
    detail: student,
  });
  document.dispatchEvent(editStudentEvent);
}

function deleteStudentEvent(student, event) {
  console.log('deleteStudentEvent event', event);
  console.log('deleteStudentEvent student', student);
  // because the event is triggered within the li element, we need to stop the event from bubbling up to the li element
  // otherwise the editStudentEvent will be triggered as well
  event.stopPropagation();

  fetch(`${backend_url}/${student.id}`, {
    method: 'DELETE',
  }).then(() => {
    getStudents();
  });
}

function render() {
  studentList.innerHTML = '';
  students.forEach((student) => {
    const studentElement = studentTemplate.content.cloneNode(true);
    studentElement.querySelector('li').classList.add(student.gender);
    const name = studentElement.querySelector('h1');
    const studentnr = studentElement.querySelector('.studentnr');
    const photo = studentElement.querySelector('.studentimg');
    const Email = studentElement.querySelector('.student-email');

    name.textContent = student.name;
    studentnr.textContent = student.studentnr;
    photo.src = `${student.photo}`;
    photo.alt = student.name;
    Email.textContent = student.email;

    studentElement.querySelector('.delete').addEventListener('click', (event) => deleteStudentEvent(student, event));
    studentElement.querySelector('li').addEventListener('click', (event) => editStudentEvent(student, event));

    studentList.appendChild(studentElement);
  });
}

// --- student-list main ---

render();
getStudents();

function findDuplicates() {
  const studentMap = new Map();
  const duplicates = [];

  students.forEach(student => {
    if (studentMap.has(student.studentnr)) {
      duplicates.push(student);
    } else {
      studentMap.set(student.studentnr, student);
    }
  });

  if (duplicates.length === 0) {
    alert("Geen dubbele studentnummers gevonden.");
    return;
  }

  const userChoice = confirm(
    `Er zijn ${duplicates.length} dubbele student(en). Wil je: \n\n - OK: Duplicaten verwijderen (behalve de eerste)\n - Cancel: De eerste dubbele student bewerken?`
  );

  if (userChoice) {
    duplicates.forEach(student => deleteStudentEvent(student, new Event('click')));
  } else {
    const firstDuplicate = duplicates[0];
    editStudentEvent(firstDuplicate, new Event('click'));
  }
}

document.querySelector('#find-duplicates').addEventListener('click', findDuplicates);