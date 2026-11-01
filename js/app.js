const horseForm = document.getElementById("horseForm");
const horseList = document.getElementById("horseList");

let horses = [];

horseForm.addEventListener("submit", function(e){

    e.preventDefault();

    const horse = {
        name: document.getElementById("horseName").value,
        breed: document.getElementById("breed").value,
        gender: document.getElementById("gender").value,
        age: document.getElementById("age").value
    };

    horses.push(horse);

    renderHorses();

    horseForm.reset();

});

function renderHorses(){

    horseList.innerHTML = "";

    horses.forEach(horse => {

        horseList.innerHTML += `
        <div class="card">

            <h3>${horse.name}</h3>

            <p>
            Breed: ${horse.breed}
            </p>

            <p>
            Gender: ${horse.gender}
            </p>

            <p>
            Age: ${horse.age}
            </p>

        </div>
        `;

    });

}