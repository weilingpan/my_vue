<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <h1 class="text-3xl font-bold mb-4">User List</h1>

    <!-- 如果還在加載，就顯示 Loading... -->
    <p v-if="loading" class="text-center text-lg">Loading...</p>

    <div class="pb-4 bg-white dark:bg-gray-900">
      <label for="table-search" class="sr-only">Search</label>
      <div class="relative mt-1">
          <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
          </div>
          <input 
            type="text"
            id="table-search"
            class="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for items">
      </div>
    </div>

    <!-- 數據加載完成後顯示表格 -->
    <table v-if="!loading && data && data.getUsers" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
    <!-- <table v-if="!loading && data && data.getUsers" class="min-w-full table-auto border-collapse bg-white shadow-md rounded-lg"> -->
      <!-- <thead class="bg-gray-200"> -->
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="p-4">ID</th>
          <th scope="col" class="p-4">Username</th>
          <th scope="col" class="p-4">Posts</th>
          <th scope="col" class="p-4">Signup Time</th>
          <th scope="col" class="p-4">Expired Time</th>
          <th scope="col" class="p-4">Action</th>
        </tr>
      </thead>
      <tbody>
        <!-- <tr v-for="user in data.getUsers" :key="user.id" class="hover:bg-gray-50"> -->
        <tr v-for="user in data.getUsers" :key="user.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
          <td class="px-6 py-4">{{ user.id }}</td>
          <td class="px-6 py-4">{{ user.username }}</td>
          <td class="px-6 py-4">{{ user.posts.length }}</td>
          <td class="px-6 py-4">{{ formatTime(user.signupTime) }}</td>
          <td class="px-6 py-4">{{ formatTime(user.expiredTime) }}</td>
          <td class="px-6 py-4">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 顯示錯誤 -->
    <p v-if="error" class="text-red-500 text-lg mt-4">Error: {{ error.message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

export const READ_USER = gql`
  query ReadUser {
    getUsers {
      id
      username
      posts {
        id
      }
      signupTime
      expiredTime
    }
  }
`;

interface Post {
  id: string;
}

interface User {
  id: string;
  username: string;
  posts: Post[];
  signupTime: string;
  expiredTime: string;
}

interface ReadUserData {
  getUsers: User[];
}

export default defineComponent({
  name: 'UserList',
  setup() {
    const { result: data, loading, error } = useQuery<ReadUserData>(READ_USER);
    const searchQuery = ref('');

    // 檢查資料
    // console.log(loading);
    // console.log('loading ... ' + loading.value);
    // console.log('error ... ' + error.value)
    console.log('check data');
    console.log(data);
    console.log('data ... ' + data.getUsers);
    if (data && data.getUsers) {
      console.log('get data')
      console.log(data.getUsers); // 這樣可以取出 `getUsers` 陣列
    }

    const formatTime = (time: string | null): string => {
      if (!time) return 'N/A';
      const date = new Date(time);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    };

    // //計算過濾後的用戶，根據搜索框過濾用戶
    // const filteredUsers = computed(() => {
    //   const query = searchQuery.value.toLowerCase();
    //   console.log('filteredUsers ... ');
    //   // return data.value.filter(data => data.username.toLowerCase().includes(query));
    // });

    return {
      data,
      loading,
      error,
      formatTime,
    };
  },
});
</script>