<template>
    <div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-blue-500">Add User</h2>
          <button @click="close" class="text-gray-500 text-xl">&times;</button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
            <input 
              v-model="username" 
              type="text" 
              id="username" 
              class="mt-1 block w-full p-2 border text-blue-500 rounded-md"
              required 
            />
          </div>
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input 
              v-model="email" 
              type="email" 
              id="email" 
              class="mt-1 block w-full p-2 border text-blue-500 rounded-md"
              required 
            />
          </div>
          <div class="flex justify-end space-x-4">
            <button @click="close" type="button" class="py-2 px-4 bg-gray-300 rounded-md">Cancel</button>
            <button type="submit" class="py-2 px-4 bg-blue-500 text-white rounded-md">Add User</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import gql from 'graphql-tag';
  import { useMutation } from '@vue/apollo-composable';
  import { defineComponent, ref } from 'vue';

  export const CREATE_USER = gql`
    mutation CreateUser($username: String!, $email: String!) {
      createUser(username: $username, email: $email) {
        id
        username
        email
      }
    }
  `;
  
  export default defineComponent({
    name: 'Modal',
    props: {
      visible: {
        type: Boolean,
        required: true
      },
    },
    emits: ['update:visible', 'userAdded'],
    setup(props, { emit }) {
      const { mutate: createUserMutation, loading, error } = useMutation(CREATE_USER);
      const username = ref('');
      const email = ref('');
  
      const close = () => {
        emit('update:visible', false);  // 關閉 modal
      };
  
      const submitForm = async () => {
        try {
          const result = await createUserMutation({
            username: username.value,
            email: email.value,
          });

          if (result) {
            alert(`New User Added: ${result.data.createUser.username}`);
            // 這裡觸發 UserList 的 refetch
            emit('userAdded');  // 向 UserView 發送通知
            close(); // 關閉 modal
          }
        } catch (e) {
          alert('Error adding user: ' + e.message);
        }
      };
  
      return {
        username,
        email,
        submitForm,
        loading,
        error,
        close
      };
    },
  });
  </script>