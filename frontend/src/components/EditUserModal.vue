<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
      <h2 class="text-xl font-bold mb-4">Edit User</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Name</label>
          <input type="text" v-model="userData.name" class="w-full p-2 border rounded">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Email</label>
          <input type="email" v-model="userData.email" class="w-full p-2 border rounded">
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" @click="close" class="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  user?: {
    name: string;
    email: string;
  };
}>();

const emit = defineEmits(['close', 'save']);

const userData = ref(props.user || { name: '', email: '' });

const close = () => {
  emit('close');
};

const handleSubmit = () => {
  emit('save', userData.value);
  close();
};
</script>
