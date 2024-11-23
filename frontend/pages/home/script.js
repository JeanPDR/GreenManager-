const collectionPoints = [];
let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.55052, lng: -46.633308 },
    zoom: 12,
  });
  loadMockPoints();
  getUserLocation();
}

function addMarkerToMap(point) {
  const marker = new google.maps.Marker({
    position: { lat: point.lat, lng: point.lng },
    map,
    title: point.name,
  });
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <h3>${point.name}</h3>
      <p>Tipo: ${point.type}</p>
      <p>Endereço: ${point.address}</p>
      <p>CEP: ${point.cep}</p>
      <img src="${point.image}" alt="${point.name}" style="width:100%; max-width:200px; margin-top:10px;" />
    `,
  });
  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
  markers.push(marker);
}

function loadMockPoints() {
  collectionPoints.forEach((point) => {
    addMarkerToMap(point);
    createCard(point);
  });
}

function createCard(point) {
  const container = document.getElementById("cardsContainer");
  const card = document.createElement("div");
  card.classList.add("card");
  card.setAttribute("data-type", point.type);
  card.innerHTML = `
    <img src="${point.image}" alt="${point.name}" class="card-image">
    <div class="card-body">
      <h3>${point.name}</h3>
      <p>${point.address}</p>
      <p>CEP: ${point.cep}</p>
      <p>${point.type}</p>
      <button class="contact-btn">Ver no Mapa</button>
    </div>
  `;
  container.appendChild(card);
  card.querySelector(".contact-btn").addEventListener("click", () => {
    map.setCenter({ lat: point.lat, lng: point.lng });
    map.setZoom(15);
  });
}

document.getElementById("filterBar").addEventListener("click", (e) => {
  if (e.target.classList.contains("filter-btn")) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");
    const filter = e.target.getAttribute("data-filter");
    filterCards(filter);
  }
});

function filterCards(filter) {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    if (filter === "all" || card.getAttribute("data-type") === filter) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

document.getElementById("searchBtn").addEventListener("click", () => {
  const address = document.getElementById("searchInput").value;
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address }, (results, status) => {
    if (status === "OK") {
      map.setCenter(results[0].geometry.location);
      map.setZoom(15);
    } else {
      alert("Endereço não encontrado.");
    }
  });
});

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const file = formData.get("image");
  const reader = new FileReader();
  reader.onload = () => {
    const data = Object.fromEntries(formData);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: data.address }, (results, status) => {
      if (status === "OK") {
        const location = results[0].geometry.location;
        const newPoint = {
          name: data.firstName,
          type: data.type,
          address: data.address,
          cep: data.cep,
          lat: location.lat(),
          lng: location.lng(),
          image: reader.result,
        };
        collectionPoints.push(newPoint);
        addMarkerToMap(newPoint);
        createCard(newPoint);
        e.target.reset();
        modal.classList.add("hidden");
      } else {
        alert("Endereço inválido.");
      }
    });
  };
  reader.readAsDataURL(file);
});

document.getElementById("openModalBtn").addEventListener("click", () => {
  document.getElementById("modal").classList.remove("hidden");
});

document.getElementById("closeModalBtn").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

document.getElementById("cancelModalBtn").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

window.onload = initMap;
