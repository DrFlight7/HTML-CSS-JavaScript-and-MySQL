// Function to fetch and display users

function fetchUsers() {
  fetch("/users")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const userList = document.getElementById("userList");
      userList.innerHTML = "";
      data.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = `${user.name} (${user.email})`;
        userList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      alert("Failed to fetch users. Please check the console for details.");
    });
}

// Call fetchUsers when the page loads
document.addEventListener('DOMContentLoaded', fetchUsers);

// Handle form submission
document.getElementById("userForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  console.log("Form submitted with:", { name, email });

  fetch("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.error || "Unknown error occurred");
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("User added:", data);
      // Fetch users again to update the list
      fetchUsers();
      // Reset the form
      document.getElementById("userForm").reset();
    })
    .catch((err) => {
      console.error("Error:", err.message);
      alert(`Failed to add user: ${err.message}`);
    });
});