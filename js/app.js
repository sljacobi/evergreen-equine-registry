const horseForm = document.getElementById("horseForm");
const horseList = document.getElementById("horseList");

let ownerFilter = "";
let brandFilter = "";

const ownersList =
    document.getElementById("ownersList");

const brandsList =
    document.getElementById("brandsList");

const historyList =
    document.getElementById("historyList");

const searchBox =
    document.getElementById("searchBox");

    searchBox.addEventListener(
    "input",
    loadHorses
);

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
        registered_name: horseName,
        breed: breed,
        gender: gender,
        age: age,

        owner_name: owner,

        horse_status: horseStatus,

        horse_origin: horseOrigin,

        brand: brand
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
    .eq("archived", false)
    .order("registered_name");

    if (error) {
        console.error(error);
        return;
    }

    const searchTerm =
    searchBox.value.toLowerCase();

    horseList.innerHTML = "";

    if (data.length === 0) {
        horseList.innerHTML =
            "<p>No horses entered yet.</p>";
        return;
    }

    data
.filter(horse => {

    if (
        ownerFilter &&
        horse.owner_name !== ownerFilter
    ) {
        return false;
    }

    if (
        brandFilter &&
        horse.brand !== brandFilter
    ) {
        return false;
    }

    return (

        (horse.registered_name || "")
            .toLowerCase()
            .includes(searchTerm)

        ||

        (horse.owner_name || "")
            .toLowerCase()
            .includes(searchTerm)

        ||

        (horse.breed || "")
            .toLowerCase()
            .includes(searchTerm)

        ||

        (horse.brand || "")
            .toLowerCase()
            .includes(searchTerm)

    );

})
.forEach(horse => {

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

<button onclick="editHorse('${horse.id}')">
    Edit
</button>

<button onclick="archiveHorse('${horse.id}')">
    Archive
</button>

        </div>
        `;

    });

const { data: historyData } =
    await supabaseClient
        .from("ownership_history")
        .select("*")
        .order("transfer_date", {
            ascending: false
        });

historyList.innerHTML = "";

if (!historyData ||
    historyData.length === 0) {

    historyList.innerHTML =
        "<p>No ownership transfers recorded.</p>";

} else {

    historyData.forEach(record => {

        historyList.innerHTML += `
            <div class="card">

                <p>
                    ${record.previous_owner}
                    →
                    ${record.new_owner}
                </p>

            </div>
        `;

    });

}

    document.getElementById("horseCount").textContent =
    data.length;

document.getElementById("activeCount").textContent =
    data.filter(
        horse => horse.archived === false
    ).length;

    const ownerCounts = {};

data.forEach(horse => {

    if (!horse.owner_name) return;

    ownerCounts[horse.owner_name] =
        (ownerCounts[horse.owner_name] || 0) + 1;

});

ownersList.innerHTML = "";

Object.entries(ownerCounts)
    .forEach(([owner,count]) => {

        ownersList.innerHTML += `
    <div class="card">

        <h3
            onclick="filterOwner('${owner}')"
            style="cursor:pointer;"
        >
            ${owner}
        </h3>

        <p>${count} horse(s)</p>

    </div>
`;

});

const brandCounts = {};

data.forEach(horse => {

    if (!horse.brand) return;

    brandCounts[horse.brand] =
        (brandCounts[horse.brand] || 0) + 1;

});

brandsList.innerHTML = "";

Object.entries(brandCounts)
    .forEach(([brand,count]) => {

        brandsList.innerHTML += `
            <div class="card">

                <h3
                    onclick="filterBrand('${brand}')"
                    style="cursor:pointer;"
                >
                    ${brand}
                </h3>

                <p>${count} horse(s)</p>

            </div>
        `;

    });

}

async function archiveHorse(id) {

    const confirmed =
        confirm("Archive this horse?");

    if (!confirmed) return;

    const { error } = await supabaseClient
        .from("horses")
        .update({
            archived: true
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("Failed to archive horse.");
        return;
    }

    loadHorses();

}

function filterOwner(owner) {

    ownerFilter = owner;

    loadHorses();

}

function filterBrand(brand) {

    brandFilter = brand;

    loadHorses();

}

function clearFilters() {

    ownerFilter = "";

    brandFilter = "";

    loadHorses();

}