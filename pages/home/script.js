let map;
let markers = [];

const API_URL = "http://localhost:3000/api/pontos";

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
    if (currentIndex < cards.length) {
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

document.getElementById("filterBar").addEventListener("click", async (e) => {
  if (e.target.classList.contains("filter-btn")) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");
    const filter = e.target.getAttribute("data-filter");
    const points = await fetchPointsFromAPI();
    createCarousel(filter, points);
  }
});

document.getElementById("searchBtn").addEventListener("click", async () => {
  const query = document.getElementById("searchInput").value.trim();

  if (!query) {
    alert("Por favor, insira um endereço.");
    return;
  }

  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    query
  )}&key=AIzaSyBSkCJaEm9fvl47b-eKWNy8qJ4X7B5qGXU`;

  try {
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status !== "OK" || data.results.length === 0) {
      alert("Endereço não encontrado. Tente novamente.");
      return;
    }

    const location = data.results[0].geometry.location;
    map.setCenter(location);
    map.setZoom(14);

    const points = await fetchPointsFromAPI();
    const filteredPoints = points.filter((point) => {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(point.lat, point.lng),
        new google.maps.LatLng(location.lat, location.lng)
      );
      return distance <= 5000;
    });

    createCarousel("all", filteredPoints);
  } catch (error) {
    console.error("Erro ao buscar o endereço:", error);
    alert("Erro ao buscar o endereço. Tente novamente.");
  }
});

window.onload = initMap;
