<script setup lang="ts"></script>

<template>
  <div class="navigation-bar">
    <RouterLink class="navigation-link" to="/">Home</RouterLink>
    <RouterLink class="navigation-link" to="/about">About</RouterLink>
  </div>
</template>

<style>
.navigation-bar {
  display: flex;
  background-color: gray;

  .navigation-link {
    padding: 10px;
    color: white;
    text-decoration: none;

    &:hover {
      background-color: black;
    }
  }
}
</style>
