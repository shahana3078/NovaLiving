document.getElementById("applyFilters").addEventListener("click", () => {
  const category = document.getElementById("categoryFilter").value;


  const queryParams = new URLSearchParams();

  if (category) queryParams.append("category", category);


  window.location.href = `/shop?${queryParams.toString()}`;
});

function applySort() {
  const sortBy = document.getElementById("sortBy").value;
  const urlParams = new URLSearchParams(window.location.search);


  urlParams.set("sortBy", sortBy);

  if (!urlParams.has("page")) {
    urlParams.set("page", 1); 
  }

  window.location.search = urlParams.toString();
}