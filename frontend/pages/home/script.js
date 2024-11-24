const API_URL = "http://localhost:3000/api/pontos";

let map;
let markers = [];
let currentIndex = 0;

async function fetchPointsFromAPI() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Erro ao carregar pontos de coleta.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.55052, lng: -46.633308 },
    zoom: 12,
  });

  loadPointsFromAPI();
  getUserLocation();
}

async function loadPointsFromAPI() {
  const points = await fetchPointsFromAPI();
  points.forEach((point) => {
    addMarkerToMap(point);
  });
  createCarousel("all", points);
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

function createCarousel(filter, points) {
  const container = document.getElementById("cardsContainer");
  const filteredPoints =
    filter === "all" ? points : points.filter((point) => point.type === filter);

  if (filteredPoints.length === 0) {
    container.innerHTML =
      "<p style='text-align: center; padding: 20px;'>Nenhum ponto encontrado.</p>";
    return;
  }

  container.innerHTML = `
    <div class="carousel">
      <button class="carousel-btn prev" id="prevBtn">&lt;</button>
      <div class="carousel-track">
        ${filteredPoints
          .map(
            (point) => `
          <div class="carousel-card" data-type="${point.type}">
            <img src="${point.image}" alt="${point.name}" class="card-image">
            <div class="card-body">
              <h3>${point.name}</h3>
              <p>${point.address}</p>
              <p>CEP: ${point.cep}</p>
              <p>Tipo: ${point.type}</p>
              <button class="contact-btn" onclick="centerOnMap(${point.lat}, ${point.lng})">Ver no Mapa</button>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      <button class="carousel-btn next" id="nextBtn">&gt;</button>
    </div>
  `;

  addCarouselFunctionality(filteredPoints);
}

function addCarouselFunctionality(points) {
  const track = document.querySelector(".carousel-track");
  const cards = document.querySelectorAll(".carousel-card");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let currentIndex = 0;

  function updateCarousel() {
    const cardStyle = getComputedStyle(cards[0]);
    const cardWidth =
      cards[0].offsetWidth +
      parseInt(cardStyle.marginLeft) +
      parseInt(cardStyle.marginRight);
    const visibleWidth = track.parentElement.offsetWidth;
    const visibleCards = Math.floor(visibleWidth / cardWidth);
    const maxIndex = Math.max(0, cards.length - visibleCards);

    currentIndex = Math.min(currentIndex, maxIndex);

    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;

    prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
    nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  nextBtn.addEventListener("click", () => {
    const cardStyle = getComputedStyle(cards[0]);
    const cardWidth =
      cards[0].offsetWidth +
      parseInt(cardStyle.marginLeft) +
      parseInt(cardStyle.marginRight);
    const visibleWidth = track.parentElement.offsetWidth;
    const visibleCards = Math.floor(visibleWidth / cardWidth);
    const maxIndex = Math.max(0, cards.length - visibleCards);

    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  window.addEventListener("resize", updateCarousel);

  updateCarousel();
}

function centerOnMap(lat, lng) {
  map.setCenter({ lat, lng });
  map.setZoom(15);
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      map.setCenter({ lat: userLat, lng: userLng });
      map.setZoom(14);
    });
  }
}

async function addPointToAPI(data) {
  try {
    const geocoder = new google.maps.Geocoder();
    const geocodeResult = await new Promise((resolve, reject) => {
      geocoder.geocode({ address: data.address }, (results, status) => {
        if (status === "OK") {
          resolve(results[0].geometry.location);
        } else {
          reject(`Erro ao geocodificar endereço: ${status}`);
        }
      });
    });

    data.lat = geocodeResult.lat();
    data.lng = geocodeResult.lng();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Erro ao cadastrar ponto de coleta.");
    }
    const newPoint = await response.json();
    return newPoint;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("firstName"),
      address: formData.get("address"),
      cep: formData.get("cep"),
      type: formData.get("type"),
      image: formData.get("image"),
    };

    try {
      const newPoint = await addPointToAPI(data);
      addMarkerToMap(newPoint);
      const points = await fetchPointsFromAPI();
      createCarousel("all", points);
      e.target.reset();
      document.getElementById("modal").classList.add("hidden");
    } catch (error) {
      alert("Erro ao cadastrar ponto de coleta.");
    }
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
