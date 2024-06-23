<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
import { ref } from "vue";

// Global constant containing the API base URL -> /api
const baseURL = import.meta.env.VITE_SERVER_API_PATH;

// Reactive variables for managing loading state and response message
const isLoading = ref(false);
const message = ref("");

// Function to fetch data from the server
async function fetchAPI() {
  try {
    // Set loading state to true
    isLoading.value = true;

    // Send a GET request to the server
    const response = await fetch(baseURL);

    // Parse the JSON response
    const data = await response.json();

    // Update the message with the response data
    message.value = data.message;
  } catch (error) {
    // Handle errors
    message.value = "Error fetching data";
    console.error(error);
  } finally {
    // Reset loading state
    isLoading.value = false;
  }
}
</script>

<template>
  <!-- Button to trigger the fetchAPI function -->
  <button @click="fetchAPI">Fetch</button>

  <!-- Display loading message while fetching data -->
  <p v-if="isLoading">Loading...</p>

  <!-- Display the response message if available -->
  <p v-else-if="message">{{ message }}</p>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
