<script setup>
import HelloWorld from './components/HelloWorld.vue'
// import PlatformHeader from "@/components/PlatformHeader.vue";
// import PlatformAside from "@/components/PlatformAside.vue";
</script>

<template>

<!--  <div class="wrapper">
    <HelloWorld msg="You did it!" />
  </div>-->
  <router-view></router-view>

</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
