let map;
let markers = [];
let currentIndex = 0;

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
  });
  createCarousel("all");
}

function createCarousel(filter) {
  const container = document.getElementById("cardsContainer");
  const filteredPoints =
    filter === "all"
      ? collectionPoints
      : collectionPoints.filter((point) => point.type === filter);

  if (filteredPoints.length === 0) {
    container.innerHTML =
      "<p style='text-align: center; padding: 20px;'>Nenhum ponto encontrado.</p>";
    return;
  }

  container.innerHTML = `
    <div class="carousel">
      ${
        filteredPoints.length > 5
          ? '<button class="carousel-btn prev" id="prevBtn">&lt;</button>'
          : ""
      }
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
              <p>${point.type}</p>
              <button class="contact-btn" onclick="centerOnMap(${point.lat}, ${point.lng})">Ver no Mapa</button>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      ${
        filteredPoints.length > 5
          ? '<button class="carousel-btn next" id="nextBtn">&gt;</button>'
          : ""
      }
    </div>
  `;
  if (filteredPoints.length > 5) {
    addCarouselFunctionality(filteredPoints);
  }
}

function addCarouselFunctionality(points) {
  const track = document.querySelector(".carousel-track");
  const cards = document.querySelectorAll(".carousel-card");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  currentIndex = 0;

  function updateCarousel() {
    const cardWidth = cards[0].offsetWidth + 20;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled =
      currentIndex >= points.length - Math.floor(track.clientWidth / cardWidth);

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
    if (currentIndex < points.length - 1) {
      currentIndex++;
      updateCarousel();
    }
  });

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

document.getElementById("filterBar").addEventListener("click", (e) => {
  if (e.target.classList.contains("filter-btn")) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");
    const filter = e.target.getAttribute("data-filter");
    createCarousel(filter);
  }
});

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
        createCarousel(
          document
            .querySelector(".filter-btn.active")
            .getAttribute("data-filter")
        );
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
