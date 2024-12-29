<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">User List</h1>

    <!-- 如果還在加載，就顯示 Loading... -->
    <p v-if="loading" class="text-center text-lg">Loading...</p>

    <!-- 數據加載完成後顯示表格 -->
    <table v-if="!loading && data && data.getUsers" class="min-w-full table-auto border-collapse bg-white shadow-md rounded-lg">
      <thead class="bg-gray-200">
        <tr>
          <th class="py-2 px-4 text-left border-b text-sm font-medium text-gray-700">ID</th>
          <th class="py-2 px-4 text-left border-b text-sm font-medium text-gray-700">Username</th>
          <th class="py-2 px-4 text-left border-b text-sm font-medium text-gray-700">Posts</th>
          <th class="py-2 px-4 text-left border-b text-sm font-medium text-gray-700">Signup Time</th>
          <th class="py-2 px-4 text-left border-b text-sm font-medium text-gray-700">Expired Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in data.getUsers" :key="user.id" class="hover:bg-gray-50">
          <td class="py-2 px-4 border-b text-sm text-gray-600">{{ user.id }}</td>
          <td class="py-2 px-4 border-b text-sm text-gray-600">{{ user.username }}</td>
          <td class="py-2 px-4 border-b text-sm text-gray-600">{{ user.posts.length }}</td>
          <td class="py-2 px-4 border-b text-sm text-gray-600">{{ formatTime(user.signupTime) }}</td>
          <td class="py-2 px-4 border-b text-sm text-gray-600">{{ formatTime(user.expiredTime) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 顯示錯誤 -->
    <p v-if="error" class="text-red-500 text-lg mt-4">Error: {{ error.message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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

    // 檢查資料
    console.log(loading);
    console.log('loading ... ' + loading.value);
    console.log('error ... ' + error.value)
    // console.log('check data');
    // console.log('data ... ' + data.value);
    // if (data.value && data.value.getUsers) {
    //   console.log('get data')
    //   console.log(data.value.getUsers); // 這樣可以取出 `getUsers` 陣列
    // }

    const formatTime = (time: string | null): string => {
      if (!time) return 'N/A';
      const date = new Date(time);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    };

    console.log('loading ... ' + loading.value);
    console.log(data);
    // console.log(data.getUsers); // 查看 `value` 內的資料

    return {
      data,
      loading,
      error,
      formatTime,
    };
  },
});
</script>