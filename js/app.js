const horseForm = document.getElementById("horseForm");
const horseList = document.getElementById("horseList");

loadHorses();

horseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const horseName = document.getElementById("horseName").value;
    const breed = document.getElementById("breed").value;
    const gender = document.getElementById("gender").value;
    const age = Number(document.getElementById("age").value);
    const owner =
    document.getElementById("owner").value;

const horseStatus =
    document.getElementById("status").value;

const horseOrigin =
    document.getElementById("origin").value;

const brand =
    document.getElementById("brand").value;

    const { error } = await supabaseClient
        .from("horses")
        .insert([
            {
{
    registered_name: horseName,
    breed: breed,
    gender: gender,
    age: age,

    owner_name: owner,

    horse_status: horseStatus,

    horse_origin: horseOrigin,

    brand: brand
}
            }
        ]);

    if (error) {
        console.error(error);
        alert("Error saving horse.");
        return;
    }

    horseForm.reset();

    loadHorses();
});

async function loadHorses() {

    const { data, error } = await supabaseClient
        .from("horses")
        .select("*")
        .order("registered_name");

    if (error) {
        console.error(error);
        return;
    }

    horseList.innerHTML = "";

    if (data.length === 0) {
        horseList.innerHTML =
            "<p>No horses entered yet.</p>";
        return;
    }

    data.forEach(horse => {

        horseList.innerHTML += `
        <div class="card">

            <h3>${horse.registered_name}</h3>

<p>Breed: ${horse.breed || ""}</p>

<p>Gender: ${horse.gender || ""}</p>

<p>Age: ${horse.age || ""}</p>

<p>Owner: ${horse.owner_name || ""}</p>

<p>Status: ${horse.horse_status || ""}</p>

<p>Origin: ${horse.horse_origin || ""}</p>

<p>Brand: ${horse.brand || ""}</p>

        </div>
        `;

    });

}