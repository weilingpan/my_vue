<template>
  <div>
    <h1>User List</h1>
    <!-- <h1>loading: {{ loading }}</h1>
    <h1>error: {{ error }}</h1>
    <h1>data: {{ data.getUsers }}</h1> -->
    <!-- 如果還在加載，就顯示 Loading... -->
    <p v-if="loading">Loading...</p>

    <!-- 數據加載完成後顯示表格 -->
    <table v-if="!loading && data && data.getUsers" border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Posts</th>
          <th>Signup Time</th>
          <th>Expired Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in data.getUsers" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.posts.length }}</td>
          <td>{{ formatTime(user.signupTime) }}</td>
          <td>{{ formatTime(user.expiredTime) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 顯示錯誤 -->
    <p v-if="error">Error: {{ error.message }}</p>
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