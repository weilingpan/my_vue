<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <h1 class="text-3xl font-bold mb-4">User List</h1>

    <!-- 如果還在加載，就顯示 Loading... -->
    <p v-if="loading" class="text-center text-lg">Loading...</p>

    <div class="pb-4 bg-white dark:bg-gray-900">
      <!-- Add User Button -->
      <button 
        @click="showAddUserModal = true"
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
        Add User
      </button>
      
      <Modal :visible="showAddUserModal" @update:visible="showAddUserModal = $event" @userAdded="refetchUserList"/>

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
    <table v-if="!loading && data && data.getUser" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
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
        <tr v-for="user in data.getUser" :key="user.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
          <td class="px-6 py-4">{{ user.id }}</td>
          <td class="px-6 py-4">{{ user.username }}</td>
          <td class="px-6 py-4">{{ user.posts.length }}</td>
          <td class="px-6 py-4">{{ formatTime(user.signupTime) }}</td>
          <td class="px-6 py-4">{{ formatTime(user.expiredTime) }}</td>
          <td class="px-6 py-4">
            <button @click="updateUser(user)"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                    Edit
            </button>
            <!-- <Modal 
              :visible="showUpdateUserModal" 
              :selectedUser=user
              @update:selectedUser="showUpdateUserModal = $event"
              @userUpdated="refetchUserList" /> -->
            <button @click="deleteUser(user.id)" 
                    class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full">
              Delete
            </button>
            <!-- <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">edit</button>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">update</button> -->
          </td>
        </tr>
      </tbody>
      <Modal 
        :visible="showUpdateUserModal" 
        :selectedUser="selectedUser"
        @update:selectedUser="showUpdateUserModal = $event"
        @userUpdated="refetchUserList" />
    </table>

    <!-- 顯示錯誤 -->
    <p v-if="error" class="text-red-500 text-lg mt-4">Error: {{ error.message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import Modal from './UserModal.vue';  // 載入 Modal 組件

const selectedUser = ref(null);

export const READ_USER = gql`
  query ReadUser {
    getUser {
      id
      username
      posts {
        id
      }
      signupTime
      expiredTime
      email
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      username
    }
  }
`;

// [
//     {
//         "__typename": "UserType",
//         "id": 1,
//         "username": "regina",
//         "posts": [
//             {
//                 "__typename": "PostType",
//                 "id": 1
//             }
//         ],
//         "signupTime": "2024-12-29T14:49:00.011000",
//         "expiredTime": "2024-12-30T14:51:06.459192"
//     },
//     {
//         "__typename": "UserType",
//         "id": 2,
//         "username": "amy",
//         "posts": [],
//         "signupTime": "2024-12-29T15:25:13.126226",
//         "expiredTime": "2024-12-30T16:05:25.874869"
//     },
//     {
//         "__typename": "UserType",
//         "id": 3,
//         "username": "lily",
//         "posts": [],
//         "signupTime": "2024-12-29T15:25:13.126226",
//         "expiredTime": "2025-01-07T15:48:29.737410"
//     }
// ]

// export const ALL_FRAGMENT = gql`
//   fragment UserFields on UserType {
//     id
//     username
//     signupTime
//     expiredTime
//   }

//   fragment PostFields on PostType {
//     id
//     title
//     authorId
//   }
// `;

// export const READ_USER = gql`
//   query ReadUser{
//     user1: getUser(username: "regina") {
//       ...UserFields
//       posts {
//         ...PostFields
//       }
//     }
//     user2: getUser(username: "lily") {
//       ...UserFields
//       posts {
//         ...PostFields
//       }
//     }
//   }
//   ${ALL_FRAGMENT}
// `;

// {
//     "user1": {
//         "__typename": "UserType",
//         "posts": [
//             {
//                 "__typename": "PostType",
//                 "id": 1,
//                 "title": "beginner#1",
//                 "authorId": 1
//             }
//         ],
//         "id": 1,
//         "username": "regina",
//         "signupTime": "2024-12-29T14:49:00.011000",
//         "expiredTime": "2024-12-30T14:51:06.459192"
//     },
//     "user2": {
//         "__typename": "UserType",
//         "posts": [],
//         "id": 3,
//         "username": "lily",
//         "signupTime": "2024-12-29T15:25:13.126226",
//         "expiredTime": "2025-01-07T15:48:29.737410"
//     }
// }


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
  getUser: User[];
}

export default defineComponent({
  name: 'UserList',
  components: {
    Modal
  },
  setup() {
    const { result: data, loading, error, refetch } = useQuery<ReadUserData>(READ_USER);
    const deleteUserMutation = useMutation(DELETE_USER);
    const searchQuery = ref('');
    const showAddUserModal = ref(false); // 用來控制 modal 的顯示與隱藏
    const showUpdateUserModal = ref(false); // 用來控制 modal 的顯示與隱藏

    const refetchUserList = async () => {
      console.log('refetchUserList ...');
      await refetch(); // 重新載入用戶列表
    };

    // 刪除用戶
    const deleteUser = async (userId: string) => {
      if (confirm(`Are you sure you want to delete user with ID ${userId}?`)) {
        try {
          await deleteUserMutation.mutate({ id: userId });
          await refetch(); // 重新載入用戶列表
          alert('User deleted successfully!');
        } catch (err) {
          console.error('Error deleting user:', err);
          alert('Failed to delete user.');
        }
      }
    };

    // 更新用戶
    const updateUser = (userObject) => {
      selectedUser.value = userObject;  // 更新選取的使用者
      alert(`Update User with ID ${userObject.id} (Implement modal or form)`);
      showUpdateUserModal.value = true;
    };

    // 檢查資料
    // console.log(loading);
    // console.log('loading ... ' + loading.value);
    // console.log('error ... ' + error.value)
    // console.log('check data');
    // console.log(data);
    // console.log('data ... ' + data.getUsers);
    // if (data && data.getUsers) {
    //   console.log('get data')
    //   console.log(data.getUsers); // 這樣可以取出 `getUsers` 陣列
    // }

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
      deleteUser,
      updateUser,
      showAddUserModal,
      showUpdateUserModal,
      refetchUserList,
      selectedUser
    };
  },
});
</script>

<!-- TODO: user fragment(https://hygraph.com/learn/graphql/fragments) -->