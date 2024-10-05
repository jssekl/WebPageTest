const routeForm = document.getElementById('route-form');
const destinationInput = document.getElementById('destination');
const start = [65.00849587940017, 25.494293018734233];
const getLocation = document.getElementById('get-location');
const routeManager = createRouteManager();

const map = L.map('map').setView(start, 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  subdomains: ['a', 'b', 'c']
}).addTo(map);


function createRouteManager() {
  let routeLayer = null;
  // removes old and adds new route
  function addRoute(route) {
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }
    routeLayer = L.polyline(route, { color: 'blue' }).addTo(map);
    map.fitBounds(routeLayer.getBounds());
  }
  return { addRoute };
}

async function fetchRouteData(destination) {
  const startLocation = [65.00849587940017, 25.494293018734233];
  const url = `https://router.project-osrm.org/route/v1/driving/${startLocation[1]},${startLocation[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// route submit
routeForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const destination = destinationInput.value.split(',').map(Number);

  if (destination.length !== 2 || isNaN(destination[0]) || isNaN(destination[1])) {
    alert('Please enter a valid destination latitude and longitude.');
    return;
  }

  try {
    const route = await fetchRouteData(destination);
    routeManager.addRoute(route);
  } catch (error) {
    console.error(error);
  }
});

// User location
getLocation.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const start = [position.coords.latitude, position.coords.longitude];
      destinationInput.value = `${position.coords.latitude},${position.coords.longitude}`;
    }, error => {
      alert('Unable to retrieve your location.');
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
});

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function () {
    const target = this.getAttribute('href').substring(1);

    // Hide all sections
    document.querySelectorAll('main > section').forEach(section => section.classList.add('hidden'));

    // Show related topics if not route-finder
    document.getElementById('related-topics').classList.toggle('hidden', target === 'route-finder');

    // Show the selected section
    const targetSection = document.getElementById(target);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }
  });
});

// document.addEventListener('DOMContentLoaded', function() {
//   // Hide all sections on page load
//   document.querySelectorAll('main > section').forEach(section => section.classList.add('hidden'));

//   // Show the home section
//   document.getElementById('home').classList.remove('hidden');
// });