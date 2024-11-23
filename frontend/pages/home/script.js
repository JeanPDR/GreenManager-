const collectionPoints = [];
let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.55052, lng: -46.633308 },
    zoom: 12,
  });
  loadMockPoints();
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
      <p>Email: ${point.email}</p>
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
  });
}

function searchAddress() {
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
}

document.getElementById("searchBtn").addEventListener("click", searchAddress);

const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const modal = document.getElementById("modal");

openModalBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

cancelModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: data.address }, (results, status) => {
    if (status === "OK") {
      const location = results[0].geometry.location;
      const newPoint = {
        name: data.firstName,
        type: data.type,
        address: data.address,
        email: data.email,
        lat: location.lat(),
        lng: location.lng(),
      };
      collectionPoints.push(newPoint);
      addMarkerToMap(newPoint);
      modal.classList.add("hidden");
      e.target.reset();
    } else {
      alert("Endereço inválido.");
    }
  });
});

window.onload = initMap;
