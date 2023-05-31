<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { reactive } from 'vue'

const state = reactive({ count: 0 })
const handleClick = function () { state.count ++ }
</script>


<template>
  <div class="card">
    <button type="button" @click="handleClick">count is {{ state.count }}</button>
  </div>
  
</template>
